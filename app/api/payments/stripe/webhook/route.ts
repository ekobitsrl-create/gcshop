import { markStripeOrderPaid, verifyStripeWebhook } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Firma mancante." }, { status: 400 });

  const payload = await request.text();
  try {
    const event = await verifyStripeWebhook(payload, signature);
    if (
      (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") &&
      event.data.object.payment_status === "paid"
    ) {
      const confirmed = await markStripeOrderPaid(event.data.object);
      if (!confirmed) return Response.json({ error: "Ordine Stripe non riconosciuto." }, { status: 400 });
    }
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Webhook Stripe non valido." }, { status: 400 });
  }
}
