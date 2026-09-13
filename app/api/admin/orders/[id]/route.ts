import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, paymentTransactions, shipments, withdrawalRequests } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";

const allowed: Record<string, Set<string>> = {
  status: new Set(["pending", "processing", "completed", "cancelled"]),
  paymentStatus: new Set(["pending", "paid", "failed", "refunded"]),
  fulfillmentStatus: new Set(["unfulfilled", "preparing", "shipped", "delivered", "returned"]),
};
const shipmentStatuses = new Set(["preparing", "shipped", "delivered", "exception", "returned"]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = getDb();
  const [order, items, shipmentRows, transactions, returnRequests] = await Promise.all([
    db.select().from(orders).where(eq(orders.id, id)).limit(1),
    db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.createdAt)),
    db.select().from(shipments).where(eq(shipments.orderId, id)).orderBy(desc(shipments.createdAt)),
    db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, id)).orderBy(desc(paymentTransactions.createdAt)),
    db.select().from(withdrawalRequests).where(eq(withdrawalRequests.orderId, id)).orderBy(desc(withdrawalRequests.submittedAt)),
  ]);
  if (!order.length) return Response.json({ error: "Ordine non trovato." }, { status: 404 });
  return Response.json({ order: order[0], items, shipments: shipmentRows, transactions, returnRequests });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json() as Record<string, unknown> & {
    shipment?: {
      status?: string;
      carrier?: string;
      service?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      labelUrl?: string;
      note?: string;
    };
  };
  const db = getDb();

  if (body.shipment) {
    const [stripePayment] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, id));
    if (stripePayment?.type === "stripe_checkout" && stripePayment.status !== "completed") {
      return Response.json({ error: "Attendi la conferma dell’incasso Stripe prima di preparare la spedizione." }, { status: 409 });
    }
    const shipment = body.shipment;
    const status = shipment.status || "preparing";
    if (!shipmentStatuses.has(status)) return Response.json({ error: "Stato spedizione non valido." }, { status: 400 });
    const existing = await db.select({ id: shipments.id, shippedAt: shipments.shippedAt, deliveredAt: shipments.deliveredAt })
      .from(shipments)
      .where(eq(shipments.orderId, id))
      .orderBy(desc(shipments.createdAt))
      .limit(1);
    const data = {
      status,
      carrier: shipment.carrier?.trim() || null,
      service: shipment.service?.trim() || null,
      trackingNumber: shipment.trackingNumber?.trim() || null,
      trackingUrl: shipment.trackingUrl?.trim() || null,
      labelUrl: shipment.labelUrl?.trim() || null,
      note: shipment.note?.trim() || null,
      shippedAt: ["shipped", "delivered"].includes(status) ? (existing[0]?.shippedAt ?? new Date().toISOString()) : existing[0]?.shippedAt,
      deliveredAt: status === "delivered" ? (existing[0]?.deliveredAt ?? new Date().toISOString()) : existing[0]?.deliveredAt,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };
    if (existing.length) await db.update(shipments).set(data).where(eq(shipments.id, existing[0].id));
    else await db.insert(shipments).values({ id: crypto.randomUUID(), orderId: id, ...data });

    const fulfillmentStatus = status === "preparing" ? "preparing" : status;
    await db.update(orders).set({ fulfillmentStatus, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, id));
    await recordAdminAction(auth.user, "update_shipment", "order", id, { status, carrier: data.carrier, trackingNumber: data.trackingNumber });
    return Response.json({ ok: true });
  }

  if (typeof body.internalNote === "string") {
    await db.update(orders).set({ internalNote: body.internalNote.trim() || null, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, id));
    await recordAdminAction(auth.user, "update_note", "order", id);
    return Response.json({ ok: true });
  }

  const field = Object.keys(allowed).find((key) => body[key] !== undefined);
  const value = field ? String(body[field]) : "";
  if (!field || !allowed[field].has(value)) return Response.json({ error: "Aggiornamento non valido." }, { status: 400 });
  const [stripePayment] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, id));
  if (stripePayment?.type === "stripe_checkout" && (field === "paymentStatus" || (stripePayment.status === "pending" && field !== "fulfillmentStatus") || (stripePayment.status !== "completed" && field === "fulfillmentStatus"))) {
    return Response.json({ error: "Il pagamento è gestito da Stripe. Per annullare un pagamento o effettuare un rimborso usa il pannello Stripe." }, { status: 409 });
  }
  await db.update(orders).set({ [field]: value, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, id));
  await recordAdminAction(auth.user, "update", "order", id, { [field]: value });
  return Response.json({ ok: true });
}
