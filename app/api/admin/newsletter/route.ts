import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { getAdminApiUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
const csvCell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
export async function GET() {
  const auth = await getAdminApiUser();
  if (auth.error) return auth.error;
  const rows = await getDb().select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
  const csv = ["email,locale,subscribed_at,consent_version,consent_text", ...rows.map(row => [row.email, row.locale, row.subscribedAt, row.consentVersion, row.consentText].map(csvCell).join(","))].join("\r\n");
  return new Response("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="lcs-newsletter.csv"', "Cache-Control": "private, no-store" } });
}
