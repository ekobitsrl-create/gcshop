import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, shipments } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const rows = await getDb().select({
    id: orders.id, orderNumber: orders.orderNumber, email: orders.email, status: orders.status,
    paymentStatus: orders.paymentStatus, fulfillmentStatus: orders.fulfillmentStatus,
    totalCents: orders.totalCents, currency: orders.currency, createdAt: orders.createdAt,
    shippingAddressJson: orders.shippingAddressJson,
    phone: orders.phone,
    paymentMethodCode: orders.paymentMethodCode,
    itemCount: sql<number>`coalesce((select sum(${orderItems.quantity}) from ${orderItems} where ${orderItems.orderId} = ${orders.id}), 0)`,
    shipmentStatus: sql<string | null>`(select ${shipments.status} from ${shipments} where ${shipments.orderId} = ${orders.id} order by ${shipments.createdAt} desc limit 1)`,
    carrier: sql<string | null>`(select ${shipments.carrier} from ${shipments} where ${shipments.orderId} = ${orders.id} order by ${shipments.createdAt} desc limit 1)`,
    trackingNumber: sql<string | null>`(select ${shipments.trackingNumber} from ${shipments} where ${shipments.orderId} = ${orders.id} order by ${shipments.createdAt} desc limit 1)`,
  }).from(orders).orderBy(desc(orders.createdAt));
  return Response.json({ orders: rows });
}
