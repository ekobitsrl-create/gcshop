import { and, desc, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/db";
import { carts, cartItems, customers, orders, orderItems, paymentTransactions, productVariants, products, inventoryMovements, coupons, couponUses } from "@/db/schema";
import { evaluateCoupon } from "@/lib/coupons";
import { buildCheckoutParams, getStripe, readStripeState } from "@/lib/stripe";
import type { Locale } from "@/lib/i18n";
import { createHash } from "node:crypto";
import type { CheckoutLaunch, PaymentMethodCode } from "@/lib/stripe-checkout";

export class CheckoutError extends Error {
  constructor(message: string, public status = 400, public orderUrl?: string) { super(message); }
}

export type CheckoutInput = {
  firstName: string; lastName: string; email: string; phone: string; addressLine1: string;
  postalCode: string; city: string; province: string; countryCode: string;
  customerNote?: string; couponCode?: string;
};

export function parseCheckoutInput(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object") throw new CheckoutError("Dati non validi.");
  const body = value as Record<string, unknown>;
  for (const key of ["firstName", "lastName", "email", "phone", "addressLine1", "postalCode", "city", "province"]) {
    if (typeof body[key] !== "string" || !body[key].trim() || body[key].length > 250) throw new CheckoutError("Completa correttamente i campi obbligatori.");
  }
  for (const key of ["customerNote", "couponCode", "countryCode"]) {
    if (body[key] !== undefined && (typeof body[key] !== "string" || body[key].length > 2000)) throw new CheckoutError("Dati non validi.");
  }
  const fields = ["firstName", "lastName", "email", "phone", "addressLine1", "postalCode", "city", "province", "countryCode", "customerNote", "couponCode"];
  const input = Object.fromEntries(fields.map((key) => [key, typeof body[key] === "string" ? body[key].trim() : undefined])) as CheckoutInput;
  input.email = input.email.toLowerCase();
  input.countryCode = (input.countryCode || "IT").toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || !/^[A-Z]{2}$/.test(input.countryCode)) throw new CheckoutError("Email o paese non valido.");
  return input;
}

// Commit reservations before contacting Stripe; retries reuse the same transaction.
export async function reserveStripeOrder(token: string, input: CheckoutInput, origin: string, db = getDb(), options: { methods: PaymentMethodCode[]; locale?: Locale; uiMode?: "custom" } = { methods: ["paypal", "bank_transfer"] }) {
  const inputFingerprint = createHash("sha256").update(JSON.stringify(Object.entries(input).filter(([, value]) => value).sort(([a], [b]) => a.localeCompare(b)))).digest("hex");
  return db.transaction(async (tx) => {
    const [cart] = await tx.select().from(carts).where(eq(carts.token, token)).for("update");
    if (!cart) throw new CheckoutError("Il carrello è vuoto.");
    if (cart.status === "checkout") {
      const [pending] = await tx.select({ id: paymentTransactions.id, state: paymentTransactions.responseJson, number: orders.orderNumber }).from(paymentTransactions)
        .innerJoin(orders, eq(orders.id, paymentTransactions.orderId))
        .where(and(eq(orders.cartId, cart.id), eq(paymentTransactions.type, "stripe_checkout"), eq(paymentTransactions.status, "pending")))
        .orderBy(desc(paymentTransactions.createdAt)).limit(1);
      if (pending) {
        const fingerprint = readStripeState(pending.state)?.inputFingerprint;
        if (fingerprint && fingerprint !== inputFingerprint) throw new CheckoutError("Esiste già un ordine in attesa con dati diversi. Riprendi il pagamento dalla pagina ordine.", 409, `/ordine/${encodeURIComponent(pending.number)}`);
        return pending.id;
      }
    }
    if (cart.status !== "active") throw new CheckoutError("Questo carrello è già stato confermato.", 409);
    const items = await tx.select({ productId: products.id, variantId: productVariants.id,
      name: products.name, title: productVariants.title, sku: productVariants.sku, quantity: cartItems.quantity,
      unitPriceCents: sql<number>`coalesce(${productVariants.priceCents}, ${products.basePriceCents})`,
      active: productVariants.isActive, productStatus: products.status, currency: products.currency,
    }).from(cartItems).innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(eq(cartItems.cartId, cart.id)).orderBy(productVariants.id);
    if (!items.length) throw new CheckoutError("Il carrello è vuoto.");
    const subtotalCents = items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
    // Serialize coupon usage checks to avoid oversubscribing a limited coupon.
    if (input.couponCode) await tx.select({ id: coupons.id }).from(coupons)
      .where(sql`upper(${coupons.code}) = ${input.couponCode.toUpperCase()}`).for("update");
    const coupon = input.couponCode ? await evaluateCoupon({ code: input.couponCode, email: input.email, subtotalCents }, tx) : null;
    if (coupon && !coupon.ok) throw new CheckoutError(coupon.error);
    const discountCents = coupon?.ok ? coupon.discountCents : 0;
    const orderId = crypto.randomUUID();
    const orderNumber = `LCS-${crypto.randomUUID().replaceAll("-", "").toUpperCase()}`;
    const params = buildCheckoutParams({ orderId, orderNumber, totalCents: subtotalCents - discountCents,
      currency: cart.currency, methods: options.methods, locale: options.locale, uiMode: options.uiMode, origin, expiresAt: Math.floor(Date.now() / 1000) + 3600 });
    const [customer] = await tx.insert(customers).values({ id: crypto.randomUUID(), email: input.email,
      firstName: input.firstName, lastName: input.lastName, phone: input.phone,
    }).onConflictDoUpdate({ target: customers.email, set: { firstName: input.firstName, lastName: input.lastName, phone: input.phone, updatedAt: sql`CURRENT_TIMESTAMP` } }).returning();
    const address = JSON.stringify({ recipientName: `${input.firstName} ${input.lastName}`, addressLine1: input.addressLine1,
      postalCode: input.postalCode, city: input.city, province: input.province, countryCode: input.countryCode });
    await tx.insert(orders).values({ id: orderId, orderNumber, customerId: customer.id, cartId: cart.id,
      email: input.email, phone: input.phone, subtotalCents, discountCents, totalCents: subtotalCents - discountCents,
      currency: cart.currency, paymentMethodCode: "stripe", shippingAddressJson: address, billingAddressJson: address,
      customerNote: input.customerNote || null });
    for (const item of items) {
      if (!item.active || item.productStatus !== "active" || item.currency !== cart.currency || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.unitPriceCents < 0) throw new CheckoutError("Prodotto non disponibile.", 409);
      const reserved = await tx.update(productVariants).set({ stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}`, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(productVariants.id, item.variantId), sql`${productVariants.stockQuantity} >= ${item.quantity}`)).returning({ id: productVariants.id });
      if (!reserved.length) throw new CheckoutError(`Giacenza insufficiente per ${item.name}.`, 409);
      await tx.insert(orderItems).values({ id: crypto.randomUUID(), orderId, productId: item.productId, variantId: item.variantId,
        productName: item.name, variantName: item.title, sku: item.sku, quantity: item.quantity,
        unitPriceCents: item.unitPriceCents, totalCents: item.unitPriceCents * item.quantity });
      await tx.insert(inventoryMovements).values({ id: crypto.randomUUID(), variantId: item.variantId,
        quantityDelta: -item.quantity, reason: "reservation", referenceType: "order", referenceId: orderId });
    }
    if (coupon?.ok) {
      const used = await tx.insert(couponUses).values({ id: crypto.randomUUID(), couponId: coupon.couponId, orderId,
        customerId: customer.id, discountCents }).onConflictDoNothing().returning({ id: couponUses.id });
      if (!used.length) throw new CheckoutError("Codice sconto già utilizzato.");
      await tx.update(coupons).set({ usageCount: sql`${coupons.usageCount} + 1` }).where(eq(coupons.id, coupon.couponId));
    }
    const transactionId = crypto.randomUUID();
    await tx.insert(paymentTransactions).values({ id: transactionId, orderId, paymentMethodCode: "stripe",
      type: "stripe_checkout", amountCents: subtotalCents - discountCents, currency: cart.currency,
      responseJson: JSON.stringify({ provider: "stripe", params, inputFingerprint }) });
    await tx.update(carts).set({ status: "checkout", updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(carts.id, cart.id));
    return transactionId;
  });
}

export async function startStripeCheckout(transactionId: string, stripe = getStripe(), db = getDb()): Promise<CheckoutLaunch> {
  const [row] = await db.select({ transaction: paymentTransactions, order: orders }).from(paymentTransactions)
    .innerJoin(orders, eq(orders.id, paymentTransactions.orderId)).where(eq(paymentTransactions.id, transactionId));
  const state = row && readStripeState(row.transaction.responseJson);
  if (!state) throw new Error("STRIPE_ORDER_NOT_FOUND");
  const orderUrl = `/ordine/${encodeURIComponent(row.order.orderNumber)}`;
  if (row.transaction.status !== "pending") return { type: "redirect", redirectUrl: orderUrl };
  if (row.transaction.providerReference) {
    const session = await stripe.checkout.sessions.retrieve(row.transaction.providerReference, { expand: ["payment_intent.latest_charge"] });
    await applyStripeSession(session, "sync", db);
    return stripeDestination(session, orderUrl, stripe);
  }
  if (Number(state.params.expires_at) <= Math.floor(Date.now() / 1000) + 1800) {
    // One Stripe customer per order lets us recover a lost create-session response.
    const sessions = state.customerId ? await stripe.checkout.sessions.list({ customer: state.customerId, limit: 100, expand: ["data.payment_intent.latest_charge"] }) : null;
    const recovered = sessions?.data.find((session) => session.metadata?.orderId === row.order.id);
    if (recovered) {
      await applyStripeSession(recovered, "sync", db);
      return stripeDestination(recovered, orderUrl, stripe);
    }
    await releaseStripeOrder(row.order.id, "expired", db);
    return { type: "redirect", redirectUrl: orderUrl };
  }
  try {
    if (!state.customerId) {
      const customer = await stripe.customers.create({ email: row.order.email, metadata: { orderId: row.order.id } }, { idempotencyKey: `customer:${transactionId}` });
      state.customerId = customer.id;
      await db.transaction(async (tx) => {
        const [current] = await tx.select().from(paymentTransactions).where(eq(paymentTransactions.id, transactionId)).for("update");
        await tx.update(paymentTransactions).set({ responseJson: JSON.stringify({ ...readStripeState(current.responseJson), customerId: customer.id }) }).where(eq(paymentTransactions.id, transactionId));
      });
    }
    const session = await stripe.checkout.sessions.create({ ...state.params, customer: state.customerId }, { idempotencyKey: `checkout:${transactionId}` });
    // A webhook can arrive before this write; never overwrite its status.
    await db.transaction(async (tx) => {
      const [current] = await tx.select().from(paymentTransactions).where(eq(paymentTransactions.id, transactionId)).for("update");
      const latest = readStripeState(current.responseJson)!;
      await tx.update(paymentTransactions).set({ providerReference: session.id,
        responseJson: JSON.stringify({ ...latest, sessionId: session.id, checkoutUrl: session.url }),
      }).where(eq(paymentTransactions.id, transactionId));
    });
    await applyStripeSession(session, "sync", db);
    return stripeDestination(session, orderUrl, stripe);
  } catch (error) {
    // Connection errors are ambiguous; keep the reservation and retry the SAME request.
    if (error && typeof error === "object" && "type" in error && error.type === "StripeInvalidRequestError") {
      await releaseStripeOrder(row.order.id, "failed", db);
    }
    throw error;
  }
}

async function stripeDestination(session: Stripe.Checkout.Session, fallback: string, stripe: Stripe): Promise<CheckoutLaunch> {
  if (session.status === "open" && session.ui_mode === "custom") {
    if (!session.client_secret || session.amount_total == null || !session.currency) throw new Error("STRIPE_SESSION_NOT_READY");
    return { type: "custom", clientSecret: session.client_secret, orderUrl: fallback, totalCents: session.amount_total, currency: session.currency };
  }
  if (session.status === "open" && session.url) return { type: "redirect", redirectUrl: session.url };
  // Custom checkout shows bank instructions on our order page.
  if (session.ui_mode === "custom") return { type: "redirect", redirectUrl: fallback };
  if (session.status === "complete" && session.payment_status === "unpaid" && session.payment_intent) {
    const id = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
    const intent = await stripe.paymentIntents.retrieve(id);
    const instructions = intent.next_action?.display_bank_transfer_instructions?.hosted_instructions_url;
    if (instructions) return { type: "redirect", redirectUrl: instructions };
  }
  return { type: "redirect", redirectUrl: fallback };
}

type DatabaseTransaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

async function releaseInTransaction(tx: DatabaseTransaction, order: typeof orders.$inferSelect, transaction: typeof paymentTransactions.$inferSelect, status: "failed" | "expired") {
  if (transaction.status !== "pending" || order.paymentStatus !== "pending") return;
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(orderItems.variantId);
  for (const item of items) {
    if (!item.variantId) continue;
    await tx.update(productVariants).set({ stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(productVariants.id, item.variantId));
    await tx.insert(inventoryMovements).values({ id: crypto.randomUUID(), variantId: item.variantId, quantityDelta: item.quantity,
      reason: "reservation_released", referenceType: "order", referenceId: order.id });
  }
  const uses = await tx.delete(couponUses).where(eq(couponUses.orderId, order.id)).returning();
  for (const use of uses) await tx.update(coupons).set({ usageCount: sql`greatest(0, ${coupons.usageCount} - 1)` }).where(eq(coupons.id, use.couponId));
  await tx.update(paymentTransactions).set({ status, processedAt: sql`CURRENT_TIMESTAMP` }).where(eq(paymentTransactions.id, transaction.id));
  await tx.update(orders).set({ status: "cancelled", paymentStatus: "failed", cancelledAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, order.id));
  if (order.cartId) await tx.update(carts).set({ status: "active", updatedAt: sql`CURRENT_TIMESTAMP` }).where(and(eq(carts.id, order.cartId), eq(carts.status, "checkout")));
}

export async function releaseStripeOrder(orderId: string, status: "failed" | "expired", db = getDb()) {
  await db.transaction(async (tx) => {
    const [transaction] = await tx.select().from(paymentTransactions).where(and(eq(paymentTransactions.orderId, orderId), eq(paymentTransactions.type, "stripe_checkout"))).for("update");
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (transaction && order) await releaseInTransaction(tx, order, transaction, status);
  });
}

// Only accept a verified webhook session or a session retrieved server-side from Stripe.
export async function applyStripeSession(session: Stripe.Checkout.Session, event: string, db = getDb()) {
  const orderId = session.metadata?.orderId;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return;
  await db.transaction(async (tx) => {
    const [transaction] = await tx.select().from(paymentTransactions).where(and(eq(paymentTransactions.orderId, orderId), eq(paymentTransactions.type, "stripe_checkout"))).for("update");
    if (!transaction) return;
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    const state = readStripeState(transaction.responseJson);
    if (!order || !state || session.client_reference_id !== order.id || session.mode !== "payment" ||
      session.amount_total !== order.totalCents || session.currency?.toUpperCase() !== order.currency.toUpperCase() ||
      (transaction.providerReference && transaction.providerReference !== session.id)) throw new Error("STRIPE_ORDER_MISMATCH");
    const intent = typeof session.payment_intent === "object" ? session.payment_intent : null;
    const charge = typeof intent?.latest_charge === "object" ? intent.latest_charge : null;
    const type = charge?.payment_method_details?.type;
    const selectedMethod = type === "card" || type === "paypal" ? type : type === "customer_balance" ? "bank_transfer" : undefined;
    await tx.update(paymentTransactions).set({ providerReference: session.id,
      ...(selectedMethod ? { paymentMethodCode: selectedMethod } : {}),
      responseJson: JSON.stringify({ ...state, sessionId: session.id, checkoutUrl: session.url }),
    }).where(eq(paymentTransactions.id, transaction.id));
    if (selectedMethod) await tx.update(orders).set({ paymentMethodCode: selectedMethod }).where(eq(orders.id, order.id));
    if (transaction.status !== "pending") return;
    if (session.payment_status === "paid") {
      await tx.update(paymentTransactions).set({ status: "completed", processedAt: sql`CURRENT_TIMESTAMP` }).where(eq(paymentTransactions.id, transaction.id));
      await tx.update(orders).set({ paymentStatus: "paid", status: "processing", paidAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, order.id));
      if (order.cartId) await tx.update(carts).set({ status: "converted", updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(carts.id, order.cartId));
    } else if (session.status === "expired" || event === "checkout.session.async_payment_failed" || event === "payment_intent.canceled") {
      await releaseInTransaction(tx, order, transaction, session.status === "expired" ? "expired" : "failed");
    }
  });
}

export async function applyStripeRefund(session: Stripe.Checkout.Session, charge: Stripe.Charge, db = getDb()) {
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const chargeIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intentId || chargeIntentId !== intentId || !session.metadata?.orderId) return;
  await applyStripeSession(session, "sync", db);
  await db.transaction(async (tx) => {
    const [transaction] = await tx.select().from(paymentTransactions).where(and(eq(paymentTransactions.providerReference, session.id), eq(paymentTransactions.type, "stripe_checkout"))).for("update");
    if (!transaction || !["completed", "refunded"].includes(transaction.status)) return;
    if (charge.amount !== transaction.amountCents || charge.currency.toUpperCase() !== transaction.currency.toUpperCase()) throw new Error("STRIPE_REFUND_MISMATCH");
    const state = readStripeState(transaction.responseJson)!;
    const fullRefund = charge.refunded && charge.amount_refunded === transaction.amountCents;
    await tx.update(paymentTransactions).set({ status: fullRefund ? "refunded" : transaction.status,
      responseJson: JSON.stringify({ ...state, refundedAmountCents: Math.max(state.refundedAmountCents || 0, charge.amount_refunded) }),
    }).where(eq(paymentTransactions.id, transaction.id));
    if (fullRefund) await tx.update(orders).set({ paymentStatus: "refunded", updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, transaction.orderId));
    // Refunds do not imply that shipped goods have been returned; do not restock automatically.
  });
}
