import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";
import { recordAdminAction } from "@/lib/audit";
import { getPaymentMethods } from "@/lib/payment-config";
import { getStripeConfiguration } from "@/lib/stripe-configuration";

export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  return Response.json({ methods: await getPaymentMethods(true), stripe: getStripeConfiguration() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const auth = await getAdminApiUser(); if (auth.error) return auth.error;
  const body = await request.json() as { methods?: Array<{ code: string; name: string; provider: string; enabled: boolean; instructions?: string }> };
  const methods = (body.methods ?? []).filter((m) => ["card", "paypal", "bank_transfer"].includes(m.code));
  for (const [index, method] of methods.entries()) {
    const existing = await getDb().select({ id: paymentMethods.id }).from(paymentMethods).where(eq(paymentMethods.code, method.code)).limit(1);
    if (existing.length) await getDb().update(paymentMethods).set({ name: method.name, provider: method.provider, isEnabled: Boolean(method.enabled), instructions: method.instructions ?? "", sortOrder: index, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(paymentMethods.id, existing[0].id));
    else await getDb().insert(paymentMethods).values({ id: crypto.randomUUID(), code: method.code, name: method.name, provider: method.provider, isEnabled: Boolean(method.enabled), instructions: method.instructions ?? "", sortOrder: index });
  }
  await recordAdminAction(auth.user, "update", "payment_methods", undefined, { codes: methods.map((m) => m.code) });
  return Response.json({ ok: true });
}
