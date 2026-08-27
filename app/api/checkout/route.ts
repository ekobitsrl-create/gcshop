import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import {
  carts,
  couponUses,
  coupons,
  customers,
  inventoryMovements,
  orderItems,
  orders,
  paymentTransactions,
  productVariants,
} from "@/db/schema";
import { getCartSnapshot } from "@/lib/cart";
import { getRequestLocale } from "@/lib/i18n-server";
import { evaluateCoupon } from "@/lib/coupons";
import { getBankTransferDetails, getPaymentMethods } from "@/lib/payment-config";
import { createPayPalOrder } from "@/lib/paypal";

type CheckoutBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  countryCode?: string;
  customerNote?: string;
  paymentMethod?: string;
  couponCode?: string;
};

export async function POST(request: Request) {
  const token = (await cookies()).get("lcs_cart")?.value;
  const cart = await getCartSnapshot(token, await getRequestLocale());
  if (!cart.cartId || !cart.items.length) return Response.json({ error: "Il carrello è vuoto." }, { status: 400 });

  const body = await request.json() as CheckoutBody;
  const required = [body.firstName, body.lastName, body.email, body.phone, body.addressLine1, body.postalCode, body.city, body.province];
  if (required.some((value) => !value?.trim())) return Response.json({ error: "Completa tutti i campi obbligatori." }, { status: 400 });

  const methods = await getPaymentMethods();
  const method = methods.find((item) => item.code === body.paymentMethod && item.enabled);
  if (!method) return Response.json({ error: "Metodo di pagamento non disponibile." }, { status: 400 });
  if (!method.configured) return Response.json({ error: "Questo metodo di pagamento non è ancora configurato." }, { status: 503 });
  for (const item of cart.items) {
    if (item.stockQuantity < item.quantity) return Response.json({ error: `Giacenza insufficiente per ${item.name}.` }, { status: 409 });
  }

  const email = body.email!.trim().toLowerCase();
  const coupon = body.couponCode?.trim()
    ? await evaluateCoupon({ code: body.couponCode, email, subtotalCents: cart.subtotalCents })
    : null;
  if (coupon && !coupon.ok) return Response.json({ error: coupon.error }, { status: 400 });
  const discountCents = coupon?.ok ? coupon.discountCents : 0;
  const totalCents = cart.subtotalCents - discountCents;

  const db = getDb();
  const existingCustomer = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
  const customerId = existingCustomer[0]?.id ?? crypto.randomUUID();
  if (existingCustomer.length) {
    await db.update(customers).set({
      firstName: body.firstName!.trim(),
      lastName: body.lastName!.trim(),
      phone: body.phone!.trim(),
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(customers.id, customerId));
  } else {
    await db.insert(customers).values({
      id: customerId,
      email,
      firstName: body.firstName!.trim(),
      lastName: body.lastName!.trim(),
      phone: body.phone!.trim(),
    });
  }

  const orderId = crypto.randomUUID();
  const orderNumber = `LCS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const address = {
    recipientName: `${body.firstName} ${body.lastName}`,
    addressLine1: body.addressLine1,
    postalCode: body.postalCode,
    city: body.city,
    province: body.province,
    countryCode: (body.countryCode || "IT").toUpperCase(),
  };

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    customerId,
    cartId: cart.cartId,
    email,
    phone: body.phone!.trim(),
    subtotalCents: cart.subtotalCents,
    discountCents,
    totalCents,
    currency: cart.currency,
    paymentMethodCode: method.code,
    shippingAddressJson: JSON.stringify(address),
    billingAddressJson: JSON.stringify(address),
    customerNote: body.customerNote?.trim() || null,
  });
  for (const item of cart.items) {
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.name,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      totalCents: item.lineTotalCents,
    });
  }

  const transactionId = crypto.randomUUID();
  await db.insert(paymentTransactions).values({
    id: transactionId,
    orderId,
    paymentMethodCode: method.code,
    type: method.code === "paypal" ? "authorization" : "instruction",
    amountCents: totalCents,
    currency: cart.currency,
  });

  let redirectUrl = `/ordine/${encodeURIComponent(orderNumber)}`;
  if (method.code === "paypal") {
    try {
      const origin = new URL(request.url).origin;
      const paypal = await createPayPalOrder({
        reference: orderId,
        amountCents: totalCents,
        currency: cart.currency,
        returnUrl: `${origin}/checkout/paypal/complete?order=${encodeURIComponent(orderNumber)}`,
        cancelUrl: `${origin}/checkout?cancelled=1`,
      });
      if (!paypal.approveUrl) throw new Error("Link PayPal mancante");
      await db.update(paymentTransactions).set({ providerReference: paypal.id, responseJson: JSON.stringify(paypal.raw) }).where(eq(paymentTransactions.id, transactionId));
      redirectUrl = paypal.approveUrl;
    } catch {
      await Promise.all([
        db.update(paymentTransactions).set({ status: "failed" }).where(eq(paymentTransactions.id, transactionId)),
        db.update(orders).set({ status: "cancelled", cancelledAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, orderId)),
      ]);
      return Response.json({ error: "PayPal non è al momento disponibile. Riprova più tardi." }, { status: 502 });
    }
  }

  if (coupon?.ok) {
    await db.insert(couponUses).values({
      id: crypto.randomUUID(),
      couponId: coupon.couponId,
      orderId,
      customerId,
      discountCents: coupon.discountCents,
    });
    await db.update(coupons).set({ usageCount: sql`${coupons.usageCount} + 1`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(coupons.id, coupon.couponId));
  }

  for (const item of cart.items) {
    await db.update(productVariants)
      .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}`, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(productVariants.id, item.variantId), sql`${productVariants.stockQuantity} >= ${item.quantity}`));
    await db.insert(inventoryMovements).values({
      id: crypto.randomUUID(),
      variantId: item.variantId,
      quantityDelta: -item.quantity,
      reason: "sale",
      referenceType: "order",
      referenceId: orderId,
    });
  }
  await db.update(carts).set({ status: "converted", updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(carts.id, cart.cartId));

  if (method.code === "bank_transfer") {
    const bank = getBankTransferDetails();
    await db.update(paymentTransactions).set({
      responseJson: JSON.stringify({ accountHolder: bank.accountHolder, iban: bank.iban, bic: bank.bic }),
    }).where(eq(paymentTransactions.id, transactionId));
  }

  return Response.json({ redirectUrl });
}
