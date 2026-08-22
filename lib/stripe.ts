import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, paymentTransactions } from "@/db/schema";
import { getRuntimeEnv } from "@/lib/runtime-env";

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeCheckoutSession = {
  id: string;
  object?: "checkout.session";
  url?: string | null;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  client_reference_id?: string | null;
  payment_intent?: string | null;
  metadata?: Record<string, string> | null;
};

type StripeErrorPayload = {
  error?: { message?: string; code?: string; type?: string };
};

function stripeSecretKey() {
  const key = getRuntimeEnv().STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_NOT_CONFIGURED");
  return key;
}

async function parseStripeResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & StripeErrorPayload;
  if (!response.ok) {
    const error = new Error(payload.error?.message ?? "STRIPE_REQUEST_FAILED");
    error.name = payload.error?.code ?? payload.error?.type ?? "STRIPE_REQUEST_FAILED";
    throw error;
  }
  return payload;
}

export async function createStripeCheckoutSession(input: {
  orderId: string;
  orderNumber: string;
  email: string;
  amountCents: number;
  currency: string;
  itemCount: number;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    throw new Error("STRIPE_AMOUNT_NOT_READY");
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("locale", "it");
  body.set("submit_type", "pay");
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  body.set("customer_email", input.email);
  body.set("client_reference_id", input.orderId);
  body.set("metadata[order_id]", input.orderId);
  body.set("metadata[order_number]", input.orderNumber);
  body.set("payment_intent_data[metadata][order_id]", input.orderId);
  body.set("payment_intent_data[metadata][order_number]", input.orderNumber);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
  body.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  body.set("line_items[0][price_data][product_data][name]", `Ordine ${input.orderNumber}`);
  body.set(
    "line_items[0][price_data][product_data][description]",
    `${input.itemCount} ${input.itemCount === 1 ? "articolo" : "articoli"} · Lusso Concept Store`,
  );

  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  return parseStripeResponse<StripeCheckoutSession>(response);
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) throw new Error("STRIPE_SESSION_INVALID");
  const response = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey()}` },
  });
  return parseStripeResponse<StripeCheckoutSession>(response);
}

export async function markStripeOrderPaid(session: StripeCheckoutSession) {
  const orderId = session.metadata?.order_id;
  const orderNumber = session.metadata?.order_number;
  if (!orderId || !orderNumber || session.payment_status !== "paid") return false;

  const db = getDb();
  const rows = await db
    .select({
      orderId: orders.id,
      orderNumber: orders.orderNumber,
      totalCents: orders.totalCents,
      currency: orders.currency,
      transactionId: paymentTransactions.id,
      providerReference: paymentTransactions.providerReference,
    })
    .from(orders)
    .innerJoin(
      paymentTransactions,
      and(eq(paymentTransactions.orderId, orders.id), eq(paymentTransactions.paymentMethodCode, "stripe")),
    )
    .where(eq(orders.id, orderId))
    .limit(1);

  const row = rows[0];
  if (
    !row ||
    row.orderNumber !== orderNumber ||
    row.providerReference !== session.id ||
    session.client_reference_id !== row.orderId ||
    session.amount_total !== row.totalCents ||
    session.currency?.toUpperCase() !== row.currency.toUpperCase()
  ) return false;

  await db.update(paymentTransactions).set({
    status: "completed",
    responseJson: JSON.stringify({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent,
    }),
    processedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(paymentTransactions.id, row.transactionId));
  await db.update(orders).set({
    status: "processing",
    paymentStatus: "paid",
    paidAt: sql`CURRENT_TIMESTAMP`,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(orders.id, row.orderId));
  return true;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyStripeWebhook(payload: string, signatureHeader: string) {
  const secret = getRuntimeEnv().STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_NOT_CONFIGURED");

  const parts = signatureHeader.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length || !/^\d+$/.test(timestamp)) throw new Error("STRIPE_SIGNATURE_INVALID");
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error("STRIPE_SIGNATURE_EXPIRED");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (!signatures.some((signature) => constantTimeEqual(signature, expected))) throw new Error("STRIPE_SIGNATURE_INVALID");

  return JSON.parse(payload) as {
    id: string;
    type: string;
    data: { object: StripeCheckoutSession };
  };
}
