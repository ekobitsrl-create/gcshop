import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { isAdminEmail, requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function removeSubscriber(form: FormData) {
  "use server";
  const user = await requireAdminPage("/admin/newsletter");
  if (!isAdminEmail(user.email)) throw new Error("Forbidden");
  const id = String(form.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid subscriber");
  await getDb().delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
  revalidatePath("/admin/newsletter");
}

export default async function NewsletterAdminPage() {
  const user = await requireAdminPage("/admin/newsletter");
  if (!isAdminEmail(user.email)) return null;
  const db = getDb();
  const [rows, counts] = await Promise.all([
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt)).limit(100),
    db.select({ count: sql<number>`count(*)` }).from(newsletterSubscribers),
  ]);
  return <main className="admin-page"><div className="admin-page-heading"><div><p>LCS / Private list</p><h1>Newsletter</h1><span>{Number(counts[0]?.count ?? 0)} iscritti · ultime 100 registrazioni</span></div><a className="admin-primary-action" href="/api/admin/newsletter">Esporta CSV →</a></div>
    <section className="admin-panel"><p>Iscrizioni con consenso registrato. Nessuna campagna viene inviata automaticamente. Gestisci qui le richieste di cancellazione ricevute e rimuovi gli indirizzi anche da eventuali copie esportate.</p>
      <div style={{ overflowX: "auto" }}><table className="admin-table"><thead><tr><th>Email</th><th>Lingua</th><th>Iscrizione</th><th>Consenso</th><th>Gestione</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.id}><td>{row.email}</td><td>{row.locale}</td><td>{new Date(row.subscribedAt).toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</td><td>{row.consentVersion}</td><td><form action={removeSubscriber}><input type="hidden" name="id" value={row.id} /><button type="submit">Cancella iscrizione</button></form></td></tr>)}
      </tbody></table></div>{!rows.length ? <p>Nessuna iscrizione registrata.</p> : null}
    </section></main>;
}
