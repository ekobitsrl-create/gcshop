import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";
import { getPaymentMethods } from "@/lib/payment-config";

export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const rows = await getDb().select().from(paymentMethods).orderBy(asc(paymentMethods.sortOrder));
  const configured = await getPaymentMethods();
  if (!rows.length) return Response.json({ methods: configured });
  return Response.json({ methods: configured.map((method) => {
    const row = rows.find((candidate) => candidate.code === method.code);
    return row ? {
      code: method.code, name: row.name, provider: row.provider, enabled: row.isEnabled, instructions: row.instructions ?? "",
      configured: method.configured,
    } : method;
  }) });
}

export async function PUT(request: Request) {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const body = await request.json() as { methods?: Array<{ code: string; name: string; provider: string; enabled: boolean; instructions?: string }> };
  const methods = (body.methods ?? []).filter((m) => m.code === "stripe" || m.code === "paypal" || m.code === "bank_transfer");
  for (const [index, method] of methods.entries()) {
    const existing = await getDb().select({ id: paymentMethods.id }).from(paymentMethods).where(eq(paymentMethods.code, method.code)).limit(1);
    if (existing.length) await getDb().update(paymentMethods).set({ name: method.name, provider: method.provider, isEnabled: Boolean(method.enabled), instructions: method.instructions ?? "", sortOrder: index, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(paymentMethods.id, existing[0].id));
    else await getDb().insert(paymentMethods).values({ id: crypto.randomUUID(), code: method.code, name: method.name, provider: method.provider, isEnabled: Boolean(method.enabled), instructions: method.instructions ?? "", sortOrder: index });
  }
  await recordAdminAction(auth.user, "update", "payment_methods", undefined, { codes: methods.map((m) => m.code) });
  return Response.json({ ok: true });
}
