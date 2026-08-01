import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";

const allowedStatuses = new Set(["draft", "active", "archived"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const { id } = await params; const body = await request.json() as { status?: string };
  if (!body.status || !allowedStatuses.has(body.status)) return Response.json({ error: "Stato non valido." }, { status: 400 });
  await getDb().update(products).set({ status: body.status, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(products.id, id));
  await recordAdminAction(auth.user, "update_status", "product", id, { status: body.status });
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const { id } = await params;
  await getDb().delete(products).where(eq(products.id, id));
  await recordAdminAction(auth.user, "delete", "product", id);
  return Response.json({ ok: true });
}
