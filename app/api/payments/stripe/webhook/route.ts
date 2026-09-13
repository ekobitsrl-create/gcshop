import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { applyStripeRefund, applyStripeSession } from "@/lib/stripe-orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return Response.json({ error: "Webhook non configurato." }, { status: 503 });
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") || "", secret);
  } catch {
    return Response.json({ error: "Firma non valida." }, { status: 400 });
  }
  try {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) {
      // Read current state to handle delayed and out-of-order events safely.
      const session = await stripe.checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id, { expand: ["payment_intent.latest_charge"] });
      await applyStripeSession(session, event.type);
    } else if (event.type === "charge.refunded") {
      const charge = await stripe.charges.retrieve((event.data.object as Stripe.Charge).id);
      const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (intentId) {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: intentId, limit: 1, expand: ["data.payment_intent.latest_charge"] });
        if (sessions.data[0]) await applyStripeRefund(sessions.data[0], charge);
      }
    } else if (event.type === "payment_intent.canceled") {
      const intent = await stripe.paymentIntents.retrieve((event.data.object as Stripe.PaymentIntent).id);
      if (intent.status === "canceled") {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: intent.id, limit: 1 });
        if (sessions.data[0]) await applyStripeSession(sessions.data[0], event.type);
      }
    }
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Notifica non elaborata." }, { status: 500 });
  }
}
