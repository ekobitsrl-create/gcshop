"use client";

import { loadStripe } from "@stripe/stripe-js/pure";
import type { Stripe, StripeCheckoutLoadActionsSuccess } from "@stripe/stripe-js";
import type { Locale } from "@/lib/i18n";

const clients = new Map<Locale, Promise<Stripe | null>>();
export function getBrowserStripe(locale: Locale) {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!key || !/^pk_(live|test)_[A-Za-z0-9]+$/.test(key)) return null;
  if (!clients.has(locale)) clients.set(locale, loadStripe(key, { locale }).catch(() => null));
  return clients.get(locale)!;
}

export async function loadCheckoutActions(stripe: Stripe, clientSecret: string) {
  const result = await stripe.initCheckoutElementsSdk({ clientSecret }).loadActions();
  if (result.type === "error") throw new Error(result.error.message);
  return result.actions;
}

export async function confirmLocalPayment(actions: StripeCheckoutLoadActionsSuccess, paymentMethod: string, expected: { amount: number; currency: string }, showTotal: (total: { amount: string; cents: number; currency: string }) => void) {
  const session = actions.getSession();
  const total = { amount: session.total.total.amount, cents: session.total.total.minorUnitsAmount, currency: session.currency };
  // Display Stripe's authoritative total before confirmation and require another
  // explicit click if a price changed after the customer reviewed the order.
  showTotal(total);
  if (total.cents !== expected.amount || total.currency.toUpperCase() !== expected.currency.toUpperCase()) return { type: "total_changed" } as const;
  return actions.confirm({ paymentMethod, redirect: "if_required" });
}
