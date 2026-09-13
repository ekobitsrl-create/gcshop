import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { carts, orders, paymentTransactions } from "@/db/schema";
import { startStripeCheckout } from "@/lib/stripe-orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = (await cookies()).get("lcs_cart")?.value;
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return Response.json({ error: "Carrello non riconosciuto." }, { status: 403 });
  try {
    const body = await request.json();
    if (typeof body.orderNumber !== "string") return Response.json({ error: "Ordine mancante." }, { status: 400 });
    const [row] = await getDb().select({ id: paymentTransactions.id }).from(paymentTransactions)
      .innerJoin(orders, eq(orders.id, paymentTransactions.orderId)).innerJoin(carts, eq(carts.id, orders.cartId))
      .where(and(eq(carts.token, token), eq(orders.orderNumber, body.orderNumber), eq(paymentTransactions.type, "stripe_checkout")));
    if (!row) return Response.json({ error: "Ordine non trovato." }, { status: 404 });
    return Response.json(await startStripeCheckout(row.id), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Pagamento temporaneamente non disponibile." }, { status: 502 });
  }
}
