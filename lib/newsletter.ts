import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { isLocale } from "@/lib/i18n";
import { newsletterCopy } from "@/lib/newsletter-copy";

export const NEWSLETTER_CONSENT_VERSION = "2026-09-17";

export function parseSubscription(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("INVALID_SUBSCRIPTION");
  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.consent !== true || input.website) throw new Error("INVALID_SUBSCRIPTION");
  return { email, locale: isLocale(input.locale) ? input.locale : "it" as const };
}

export async function subscribe(input: ReturnType<typeof parseSubscription>, db = getDb()) {
  await db.insert(newsletterSubscribers).values({
    id: crypto.randomUUID(), email: input.email, locale: input.locale,
    consentVersion: NEWSLETTER_CONSENT_VERSION, consentText: newsletterCopy[input.locale].consent,
  }).onConflictDoNothing({ target: newsletterSubscribers.email });
}
