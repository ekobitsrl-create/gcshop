import { retrieveStripeCheckoutSession, markStripeOrderPaid } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const orderNumber = url.searchParams.get("order");
  if (!sessionId || !orderNumber) return Response.redirect(new URL("/checkout?payment=invalid", url.origin));

  try {
    const session = await retrieveStripeCheckoutSession(sessionId);
    const confirmed = session.metadata?.order_number === orderNumber && await markStripeOrderPaid(session);
    if (!confirmed) return Response.redirect(new URL("/checkout?payment=pending", url.origin));
    return Response.redirect(new URL(`/ordine/${encodeURIComponent(orderNumber)}`, url.origin));
  } catch {
    return Response.redirect(new URL("/checkout?payment=error", url.origin));
  }
}
