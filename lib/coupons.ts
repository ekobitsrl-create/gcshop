import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons, orders } from "@/db/schema";

type CouponSuccess = {
  ok: true;
  couponId: string;
  code: string;
  discountCents: number;
  totalCents: number;
};

type CouponFailure = { ok: false; error: string };

export type CouponEvaluation = CouponSuccess | CouponFailure;

export async function evaluateCoupon(input: {
  code: string;
  email?: string;
  subtotalCents: number;
}): Promise<CouponEvaluation> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Inserisci un codice sconto." };

  const db = getDb();
  const matches = await db
    .select()
    .from(coupons)
    .where(and(sql`upper(${coupons.code}) = ${code}`, eq(coupons.isActive, true)))
    .limit(1);
  const coupon = matches[0];
  if (!coupon) return { ok: false, error: "Codice sconto non valido." };

  const now = Date.now();
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) return { ok: false, error: "Questo codice non è ancora attivo." };
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() < now) return { ok: false, error: "Questo codice è scaduto." };
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return { ok: false, error: "Questo codice ha raggiunto il limite di utilizzi." };
  if (coupon.minimumOrderCents !== null && input.subtotalCents < coupon.minimumOrderCents) {
    return { ok: false, error: "Il totale della borsa non raggiunge il minimo richiesto." };
  }

  if (coupon.firstOrderOnly) {
    const email = input.email?.trim().toLowerCase();
    if (!email) return { ok: false, error: "Inserisci prima la tua email per verificare il primo ordine." };
    const previousOrder = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(sql`lower(${orders.email}) = ${email}`, ne(orders.status, "cancelled")))
      .limit(1);
    if (previousOrder.length) return { ok: false, error: "WELCOME10 è riservato al primo ordine." };
  }

  const calculated = coupon.type === "fixed"
    ? coupon.value
    : Math.round(input.subtotalCents * coupon.value / 100);
  const capped = coupon.maximumDiscountCents === null
    ? calculated
    : Math.min(calculated, coupon.maximumDiscountCents);
  const discountCents = Math.max(0, Math.min(input.subtotalCents, capped));

  return {
    ok: true,
    couponId: coupon.id,
    code,
    discountCents,
    totalCents: input.subtotalCents - discountCents,
  };
}
