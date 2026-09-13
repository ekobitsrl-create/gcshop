import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test, { after, beforeEach } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import type { getDb } from "../db/index";
import * as schema from "../db/schema";
import { applyStripeRefund, applyStripeSession, parseCheckoutInput, reserveStripeOrder, startStripeCheckout, type CheckoutInput } from "../lib/stripe-orders";
import { buildCheckoutParams, readBankInstructions, readStripeState } from "../lib/stripe";
import { confirmLocalPayment } from "../lib/stripe-browser";
import type { StripeCheckoutLoadActionsSuccess } from "@stripe/stripe-js";
import { POST as webhook } from "../app/api/payments/stripe/webhook/route";
import { getPaymentMethods } from "../lib/payment-config";

const pg = new PGlite();
for (const file of (await readdir(new URL("../drizzle/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort()) {
  await pg.exec(await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"));
}
const db = drizzle(pg, { schema }) as unknown as ReturnType<typeof getDb>;
const { carts, cartItems, products, productVariants, orders, paymentTransactions, inventoryMovements, coupons, couponUses } = schema;
let token: string;
let cartId: string;
let variantId: string;
const input: CheckoutInput = { firstName: "Test", lastName: "Buyer", email: "buyer@example.com", phone: "123456789",
  addressLine1: "Via Test 1", postalCode: "00100", city: "Roma", province: "RM", countryCode: "IT" };

beforeEach(async () => {
  await pg.exec("TRUNCATE luxury.products, luxury.carts, luxury.customers, luxury.coupons CASCADE");
  token = crypto.randomUUID(); cartId = crypto.randomUUID(); variantId = crypto.randomUUID();
  const productId = crypto.randomUUID();
  await db.insert(products).values({ id: productId, name: "Test product", slug: "test", sku: "SKU", status: "active", basePriceCents: 10000 });
  await db.insert(productVariants).values({ id: variantId, productId, sku: "SKU-V", stockQuantity: 3 });
  await db.insert(carts).values({ id: cartId, token });
  // The checkout must use the authoritative current price, not this stale cart price.
  await db.insert(cartItems).values({ id: crypto.randomUUID(), cartId, productId, variantId, quantity: 2, unitPriceCents: 10 });
});
after(async () => { await pg.close(); });

async function reservation(method: "paypal" | "bank_transfer" = "paypal", couponCode?: string) {
  const id = await reserveStripeOrder(token, { ...input, couponCode }, "https://shop.example", db, { methods: [method] });
  const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
  const [order] = await db.select().from(orders).where(eq(orders.id, transaction.orderId));
  return { id, transaction, order };
}

function session(order: typeof orders.$inferSelect, overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return { id: "cs_test_order", mode: "payment", status: "open", payment_status: "unpaid",
    amount_total: order.totalCents, currency: "eur", client_reference_id: order.id, metadata: { orderId: order.id },
    url: "https://checkout.stripe.com/test", ...overrides } as Stripe.Checkout.Session;
}

test("reserves stock once, keeps payment pending and deduplicates double checkout", async () => {
  const [a, b] = await Promise.all([
    reserveStripeOrder(token, input, "https://shop.example", db), reserveStripeOrder(token, input, "https://shop.example", db),
  ]);
  assert.equal(a, b);
  assert.equal((await db.select().from(orders)).length, 1);
  assert.equal((await db.select().from(orders))[0].totalCents, 20000);
  assert.equal((await db.select().from(orders))[0].paymentStatus, "pending");
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 1);
  assert.equal((await db.select().from(inventoryMovements)).length, 1);
});

test("rolls back every write when stock is insufficient", async () => {
  await db.update(productVariants).set({ stockQuantity: 1 });
  await assert.rejects(reservation(), /Giacenza insufficiente/);
  assert.equal((await db.select().from(orders)).length, 0);
  assert.equal((await db.select().from(paymentTransactions)).length, 0);
  assert.equal((await db.select().from(inventoryMovements)).length, 0);
  assert.equal((await db.select().from(carts))[0].status, "active");
});

test("lets Stripe offer both methods and keeps the choice unset until the customer pays", async () => {
  const id = await reserveStripeOrder(token, input, "https://shop.example", db, { methods: ["paypal", "bank_transfer"], locale: "fr" });
  const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
  const [order] = await db.select().from(orders);
  const params = readStripeState(transaction.responseJson)!.params;
  assert.deepEqual(params.payment_method_types, ["paypal", "customer_balance"]);
  assert.equal(params.locale, "fr");
  assert.equal(order.paymentMethodCode, "stripe");
  assert.equal(transaction.paymentMethodCode, "stripe");
});

test("offers only enabled methods and rejects checkout without any methods", async () => {
  await assert.rejects(reserveStripeOrder(token, input, "https://shop.example", db, { methods: [] }), /INVALID_PAYMENT_METHODS/);
  assert.equal((await db.select().from(orders)).length, 0);
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 3);
  const { transaction } = await reservation("paypal");
  const params = readStripeState(transaction.responseJson)!.params;
  assert.deepEqual(params.payment_method_types, ["paypal"]);
  assert.equal(params.payment_method_options, undefined);
});

for (const [type, code] of [["card", "card"], ["paypal", "paypal"], ["customer_balance", "bank_transfer"]] as const) {
  test(`records the ${code} choice confirmed by Stripe and preserves it on later unexpanded events`, async () => {
    const id = await reserveStripeOrder(token, input, "https://shop.example", db);
    const [order] = await db.select().from(orders);
    const intent = { id: "pi_choice", latest_charge: { id: "ch_choice", payment_method_details: { type } } } as Stripe.PaymentIntent;
    const paid = session(order, { status: "complete", payment_status: "paid", payment_intent: intent });
    await applyStripeSession(paid, "checkout.session.completed", db);
    await applyStripeSession({ ...paid, payment_intent: "pi_choice" }, "sync", db);
    assert.equal((await db.select().from(orders))[0].paymentMethodCode, code);
    assert.equal((await db.select().from(orders))[0].paymentStatus, "paid");
    assert.equal((await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id)))[0].paymentMethodCode, code);
  });
}

test("bank transfer checkout completion does not mark unpaid orders paid", async () => {
  const { order } = await reservation("bank_transfer");
  await applyStripeSession(session(order, { status: "complete" }), "checkout.session.completed", db);
  assert.equal((await db.select().from(orders))[0].paymentStatus, "pending");
  assert.equal((await db.select().from(carts))[0].status, "checkout");
});

test("async success is idempotent and a stale failure cannot undo payment", async () => {
  const { order } = await reservation("bank_transfer");
  const paid = session(order, { status: "complete", payment_status: "paid" });
  await Promise.all([applyStripeSession(paid, "checkout.session.async_payment_succeeded", db), applyStripeSession(paid, "checkout.session.completed", db)]);
  await applyStripeSession(session(order, { status: "expired" }), "checkout.session.expired", db);
  const [saved] = await db.select().from(orders);
  assert.equal(saved.paymentStatus, "paid"); assert.equal(saved.status, "processing"); assert.ok(saved.paidAt);
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 1);
  assert.equal((await db.select().from(carts))[0].status, "converted");
});

test("expiration releases inventory and coupon exactly once and allows retry", async () => {
  await db.insert(coupons).values({ id: crypto.randomUUID(), code: "WELCOME10", type: "percentage", value: 10, firstOrderOnly: true, isActive: true });
  const { order } = await reservation("paypal", "WELCOME10");
  assert.equal(order.totalCents, 18000);
  const expired = session(order, { status: "expired", url: null });
  await Promise.all([applyStripeSession(expired, "checkout.session.expired", db), applyStripeSession(expired, "checkout.session.expired", db)]);
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 3);
  assert.equal((await db.select().from(carts))[0].status, "active");
  assert.equal((await db.select().from(coupons))[0].usageCount, 0);
  assert.equal((await db.select().from(couponUses)).length, 0);
  assert.equal((await db.select().from(inventoryMovements)).length, 2);
  await reservation("paypal", "WELCOME10");
  assert.equal((await db.select().from(coupons))[0].usageCount, 1);
});

test("failure and canceled bank payments release reserved inventory", async () => {
  const { order } = await reservation("bank_transfer");
  await applyStripeSession(session(order, { status: "complete" }), "payment_intent.canceled", db);
  assert.equal((await db.select().from(orders))[0].paymentStatus, "failed");
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 3);
});

test("wrong amount, currency or order association never fulfills an order", async () => {
  const { order } = await reservation();
  for (const overrides of [{ amount_total: 1 }, { currency: "usd" }, { client_reference_id: "another-order" }]) {
    await assert.rejects(applyStripeSession(session(order, { ...overrides, payment_status: "paid" }), "sync", db), /MISMATCH/);
  }
  assert.equal((await db.select().from(orders))[0].paymentStatus, "pending");
  await applyStripeSession(session(order), "sync", db);
  await assert.rejects(applyStripeSession(session(order, { id: "cs_wrong", payment_status: "paid" }), "sync", db), /MISMATCH/);
});

test("network retries reuse Stripe idempotency keys and never release stock prematurely", async () => {
  const { id, order } = await reservation();
  const keys: string[] = [];
  let calls = 0;
  const fake = { customers: { create: async () => ({ id: "cus_test" }) }, checkout: { sessions: {
    create: async (_params: unknown, options: { idempotencyKey: string }) => {
      keys.push(options.idempotencyKey);
      if (++calls === 1) throw { type: "StripeConnectionError" };
      return session(order);
    },
  } } } as unknown as Stripe;
  await assert.rejects(startStripeCheckout(id, fake, db));
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 1);
  assert.deepEqual(await startStripeCheckout(id, fake, db), { type: "redirect", redirectUrl: "https://checkout.stripe.com/test" });
  assert.equal(keys[0], keys[1]);
  assert.equal((await db.select().from(orders)).length, 1);
});

test("a definitive Stripe rejection returns stock and permits a fresh order", async () => {
  const { id } = await reservation();
  const fake = { customers: { create: async () => ({ id: "cus_test" }) }, checkout: { sessions: {
    create: async () => { throw { type: "StripeInvalidRequestError" }; },
  } } } as unknown as Stripe;
  await assert.rejects(startStripeCheckout(id, fake, db));
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 3);
  assert.equal((await db.select().from(carts))[0].status, "active");
});

test("bank transfer resume returns Stripe's hosted payment instructions", async () => {
  const { id, order } = await reservation("bank_transfer");
  await applyStripeSession(session(order), "sync", db);
  const fake = { checkout: { sessions: { retrieve: async () => session(order, { status: "complete", payment_intent: "pi_test", url: null }) } },
    paymentIntents: { retrieve: async () => ({ next_action: { display_bank_transfer_instructions: { hosted_instructions_url: "https://payments.stripe.com/instructions" } } }) },
  } as unknown as Stripe;
  assert.deepEqual(await startStripeCheckout(id, fake, db), { type: "redirect", redirectUrl: "https://payments.stripe.com/instructions" });
});

test("recovers a lost Stripe response without creating another session", async () => {
  const { id, order, transaction } = await reservation();
  const state = readStripeState(transaction.responseJson)!;
  state.customerId = "cus_test"; state.params.expires_at = 1;
  await db.update(paymentTransactions).set({ responseJson: JSON.stringify(state) }).where(eq(paymentTransactions.id, id));
  const fake = { checkout: { sessions: { list: async () => ({ data: [session(order)] }) } } } as unknown as Stripe;
  assert.deepEqual(await startStripeCheckout(id, fake, db), { type: "redirect", redirectUrl: "https://checkout.stripe.com/test" });
  assert.equal((await db.select().from(paymentTransactions))[0].providerReference, "cs_test_order");
});

test("validates input and uses EUR bank transfers, not SEPA direct debit", () => {
  assert.throws(() => parseCheckoutInput({ ...input, email: 123 }));
  assert.equal("paymentMethod" in parseCheckoutInput({ ...input, paymentMethod: "manual" }), false);
  assert.throws(() => parseCheckoutInput({ ...input, countryCode: "ITALIA" }));
  assert.equal(parseCheckoutInput({ ...input, email: " Buyer@Example.com " }).email, "buyer@example.com");
  const params = buildCheckoutParams({ orderId: "id", orderNumber: "number", totalCents: 1000, currency: "EUR", methods: ["bank_transfer"], origin: "https://shop.example", expiresAt: 123 });
  assert.deepEqual(params.payment_method_types, ["customer_balance"]);
  assert.equal(params.payment_method_options?.customer_balance?.bank_transfer?.type, "eu_bank_transfer");
  assert.throws(() => buildCheckoutParams({ orderId: "id", orderNumber: "number", totalCents: 0, currency: "EUR", methods: ["paypal"], origin: "https://shop.example", expiresAt: 123 }));
});

test("refunds update the order without restocking shipped goods or undoing partial refunds", async () => {
  const { order } = await reservation();
  const paid = session(order, { status: "complete", payment_status: "paid", payment_intent: "pi_refund" });
  const charge = { id: "ch_refund", payment_intent: "pi_refund", currency: "eur", amount: order.totalCents, amount_refunded: 500, refunded: false } as Stripe.Charge;
  await applyStripeRefund(paid, charge, db);
  assert.equal((await db.select().from(orders))[0].paymentStatus, "paid");
  await applyStripeRefund(paid, { ...charge, amount_refunded: order.totalCents, refunded: true }, db);
  await applyStripeSession(paid, "checkout.session.completed", db);
  assert.equal((await db.select().from(orders))[0].paymentStatus, "refunded");
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 1);
});

test("old abandoned creation attempts with no Stripe session release stock on recovery", async () => {
  const { id, transaction } = await reservation();
  const state = readStripeState(transaction.responseJson)!;
  state.params.expires_at = 1;
  await db.update(paymentTransactions).set({ responseJson: JSON.stringify(state) });
  await startStripeCheckout(id, {} as Stripe, db);
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 3);
  assert.equal((await db.select().from(paymentTransactions))[0].status, "expired");
});

test("webhook rejects missing or tampered signatures without touching the database", async () => {
  const originalKey = process.env.STRIPE_SECRET_KEY; const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = "sk_test_fake"; process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake";
  try {
    const payload = JSON.stringify({ type: "unrelated.event", data: { object: {} } });
    const stripe = new Stripe("sk_test_fake");
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_fake" });
    assert.equal((await webhook(new Request("https://shop.example/webhook", { method: "POST", body: payload }))).status, 400);
    assert.equal((await webhook(new Request("https://shop.example/webhook", { method: "POST", body: payload + " ", headers: { "stripe-signature": signature } }))).status, 400);
    assert.equal((await webhook(new Request("https://shop.example/webhook", { method: "POST", body: payload, headers: { "stripe-signature": signature } }))).status, 200);
  } finally {
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = originalKey;
    if (originalSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET; else process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  }
});

test("disabling every payment method does not bring back the defaults", async () => {
  await db.delete(schema.paymentMethods);
  for (const code of ["paypal", "bank_transfer"]) {
    await db.insert(schema.paymentMethods).values({ id: crypto.randomUUID(), code, name: code, provider: "legacy", isEnabled: false });
  }
  assert.deepEqual(await getPaymentMethods(false, db), []);
  const admin = await getPaymentMethods(true, db);
  assert.equal(admin.length, 3);
  assert.ok(admin.every((method) => method.provider === "stripe" && !method.enabled));
});

test("custom checkout exposes a client secret instead of sending the buyer to Stripe", async () => {
  const id = await reserveStripeOrder(token, input, "https://shop.example", db, { methods: ["card", "paypal", "bank_transfer"], uiMode: "custom" });
  const [order] = await db.select().from(orders);
  let params: Stripe.Checkout.SessionCreateParams | undefined;
  const custom = session(order, { ui_mode: "custom", client_secret: "cs_test_order_secret_fixture", url: null });
  const fake = { customers: { create: async () => ({ id: "cus_test" }) }, checkout: { sessions: {
    create: async (value: Stripe.Checkout.SessionCreateParams) => { params = value; return custom; },
    retrieve: async () => custom,
  } } } as unknown as Stripe;
  const launch = await startStripeCheckout(id, fake, db);
  assert.deepEqual(launch, { type: "custom", clientSecret: custom.client_secret, orderUrl: `/ordine/${order.orderNumber}`, totalCents: 20000, currency: "eur" });
  assert.equal(params?.ui_mode, "custom");
  assert.equal(params?.success_url, undefined); assert.equal(params?.cancel_url, undefined);
  assert.equal(params?.return_url, `https://shop.example/ordine/${order.orderNumber}`);
  assert.deepEqual(params?.payment_method_types, ["card", "paypal", "customer_balance"]);
  assert.equal(params?.customer, "cus_test");
  assert.deepEqual(await startStripeCheckout(id, fake, db), launch);
  assert.ok(!(await db.select().from(paymentTransactions))[0].responseJson?.includes("secret_fixture"));
});

test("a retry with different order details cannot silently pay for the earlier order", async () => {
  await reservation();
  await assert.rejects(reserveStripeOrder(token, { ...input, addressLine1: "Different address" }, "https://shop.example", db), (error: unknown) => {
    assert.ok(error instanceof Error && "orderUrl" in error && String(error.orderUrl).startsWith("/ordine/")); return true;
  });
  assert.equal((await db.select().from(orders)).length, 1);
  assert.equal((await db.select().from(productVariants))[0].stockQuantity, 1);
});

test("bank transfer instructions remain in the store for custom checkout", async () => {
  const { id, order } = await reservation("bank_transfer");
  const intent = { id: "pi_bank", next_action: { display_bank_transfer_instructions: {
    amount_remaining: 15000, currency: "eur", reference: "REFERENCE", financial_addresses: [{ iban: { iban: "DE_TEST_IBAN", bic: "TESTBIC", account_holder_name: "Test account" } }],
  } } } as Stripe.PaymentIntent;
  const custom = session(order, { status: "complete", ui_mode: "custom", payment_intent: intent, url: null });
  await applyStripeSession(custom, "checkout.session.completed", db);
  const fake = { checkout: { sessions: { retrieve: async () => custom } } } as unknown as Stripe;
  assert.deepEqual(await startStripeCheckout(id, fake, db), { type: "redirect", redirectUrl: `/ordine/${order.orderNumber}` });
  assert.deepEqual(readBankInstructions(custom), { amountRemaining: 15000, currency: "eur", reference: "REFERENCE", accounts: [{ iban: "DE_TEST_IBAN", bic: "TESTBIC", accountHolder: "Test account" }] });
  assert.equal(readBankInstructions({ ...custom, payment_status: "paid" }), null);
  assert.equal((await db.select().from(orders))[0].paymentStatus, "pending");
});

test("card confirmation only redirects when authorization requires it and displays the total first", async () => {
  const events: string[] = [];
  const actions = { getSession: () => ({ currency: "eur", total: { total: { amount: "200,00 €", minorUnitsAmount: 20000 } } }),
    confirm: async (options: unknown) => { events.push("confirm"); assert.deepEqual(options, { paymentMethod: "pm_test", redirect: "if_required" }); return { type: "success" }; },
  } as unknown as StripeCheckoutLoadActionsSuccess;
  const result = await confirmLocalPayment(actions, "pm_test", { amount: 20000, currency: "EUR" }, () => events.push("display"));
  assert.equal(result.type, "success"); assert.deepEqual(events, ["display", "confirm"]);
});

test("a changed total requires another customer confirmation before a charge", async () => {
  let confirmations = 0;
  const actions = { getSession: () => ({ currency: "eur", total: { total: { amount: "200,00 €", minorUnitsAmount: 20000 } } }), confirm: async () => { confirmations++; },
  } as unknown as StripeCheckoutLoadActionsSuccess;
  const result = await confirmLocalPayment(actions, "pm_test", { amount: 18000, currency: "EUR" }, (total) => assert.equal(total.cents, 20000));
  assert.equal(result.type, "total_changed"); assert.equal(confirmations, 0);
});
