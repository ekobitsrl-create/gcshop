import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";

const allowed: Record<string, Set<string>> = {
  status: new Set(["pending", "processing", "completed", "cancelled"]),
  paymentStatus: new Set(["pending", "paid", "failed", "refunded"]),
  fulfillmentStatus: new Set(["unfulfilled", "preparing", "shipped", "delivered"]),
};
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const { id } = await params; const body = await request.json() as Record<string, string>;
  const field = Object.keys(allowed).find((key) => body[key] !== undefined);
  if (!field || !allowed[field].has(body[field])) return Response.json({ error: "Aggiornamento non valido." }, { status: 400 });
  await getDb().update(orders).set({ [field]: body[field], updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, id));
  await recordAdminAction(auth.user, "update", "order", id, { [field]: body[field] });
  return Response.json({ ok: true });
}
