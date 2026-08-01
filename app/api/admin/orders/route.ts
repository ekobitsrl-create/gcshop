import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const rows = await getDb().select({
    id: orders.id, orderNumber: orders.orderNumber, email: orders.email, status: orders.status,
    paymentStatus: orders.paymentStatus, fulfillmentStatus: orders.fulfillmentStatus,
    totalCents: orders.totalCents, currency: orders.currency, createdAt: orders.createdAt,
    itemCount: sql<number>`coalesce((select sum(${orderItems.quantity}) from ${orderItems} where ${orderItems.orderId} = ${orders.id}), 0)`,
  }).from(orders).orderBy(desc(orders.createdAt));
  return Response.json({ orders: rows });
}
