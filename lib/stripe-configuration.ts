import { SITE_URL } from "@/lib/site-url.mjs";

type StripeEnvironment = Record<string, string | undefined>;

export function resolveCheckoutOrigin(env: StripeEnvironment = process.env) {
  const url = new URL(env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL);
  const local = env.NODE_ENV !== "production" && url.hostname === "localhost";
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("INVALID_SITE_URL");
  }
  return url.origin;
}

// Safe for the authenticated admin response: never include credential values.
export function getStripeConfiguration(env: StripeEnvironment = process.env) {
  const required = ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"] as const;
  const missing: string[] = required.filter((name) => !env[name]?.trim());
  const invalid: string[] = [];
  const secretMode = /^(?:sk|rk)_(live|test)_[A-Za-z0-9]+$/.exec(env.STRIPE_SECRET_KEY?.trim() || "")?.[1];
  const publicMode = /^pk_(live|test)_[A-Za-z0-9]+$/.exec(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "")?.[1];
  if (!missing.includes("STRIPE_SECRET_KEY") && !secretMode) invalid.push("STRIPE_SECRET_KEY");
  if (!missing.includes("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") && !publicMode) invalid.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  if (!missing.includes("STRIPE_WEBHOOK_SECRET") && !/^whsec_[A-Za-z0-9]+$/.test(env.STRIPE_WEBHOOK_SECRET!.trim())) invalid.push("STRIPE_WEBHOOK_SECRET");
  const modeMismatch = Boolean(secretMode && publicMode && secretMode !== publicMode);
  let origin: string | null = null;
  try { origin = resolveCheckoutOrigin(env); } catch { invalid.push("NEXT_PUBLIC_SITE_URL"); }
  return {
    configured: !missing.length && !invalid.length && !modeMismatch,
    missing, invalid, modeMismatch, mode: secretMode === "live" ? "live" : secretMode === "test" ? "test" : null,
    origin, usesDefaultOrigin: !env.NEXT_PUBLIC_SITE_URL?.trim(),
  };
}

export type StripeConfiguration = ReturnType<typeof getStripeConfiguration>;
