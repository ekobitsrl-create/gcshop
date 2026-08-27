import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { catalogImports, orders, products, productVariants } from "@/db/schema";
import { formatMoney } from "@/lib/store-utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = getDb();
  const [productCount, orderCount, revenue, lowStockCount, recentOrders, latestImport] = await Promise.all([
    db.select({ value: sql<number>`count(*)` }).from(products).where(sql`${products.status} = 'active'`),
    db.select({ value: sql<number>`count(*)` }).from(orders),
    db.select({ value: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.paymentStatus} = 'paid'), 0)` }).from(orders),
    db
      .select({ value: sql<number>`count(*)` })
      .from(productVariants)
      .where(sql`${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold}`),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db.select().from(catalogImports).orderBy(desc(catalogImports.startedAt)).limit(1),
  ]);

  const cards = [
    { label: "Prodotti online", value: productCount[0]?.value ?? 0, note: "pubblicati" },
    { label: "Ordini", value: orderCount[0]?.value ?? 0, note: "totali" },
    { label: "Incassato", value: formatMoney(Number(revenue[0]?.value ?? 0)), note: "ordini pagati" },
    { label: "Scorte basse", value: lowStockCount[0]?.value ?? 0, note: "da verificare" },
  ];

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div><p>LCS / Operations</p><h1>Control room.</h1><span className="admin-heading-note">Catalogo, vendite e spedizioni sotto controllo.</span></div>
        <a className="admin-primary-action" href="/admin/prodotti">Gestisci catalogo →</a>
      </div>

      <section className="admin-metrics" aria-label="Riepilogo negozio">
        {cards.map((card, index) => (
          <article key={card.label}>
            <span>0{index + 1}</span><p>{card.label}</p><strong>{card.value}</strong><small>{card.note}</small>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-band">
        <div><p className="admin-eyebrow">Catalog feed</p><h2>Romanelli sincronizzato.</h2><span>{latestImport[0]?.productsImported ?? 0} prodotti · {latestImport[0]?.variantsImported ?? 0} varianti · {latestImport[0]?.imagesImported ?? 0} immagini</span></div>
        <div><span className={`admin-feed-state is-${latestImport[0]?.status ?? "unknown"}`}>{latestImport[0]?.status ?? "non disponibile"}</span><small>Ultimo aggiornamento<br />{latestImport[0]?.completedAt ? new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(latestImport[0].completedAt)) : "—"}</small></div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><p>Attività recente</p><h2>Ultimi ordini</h2></div>
          <a href="/admin/ordini">Vedi tutti →</a>
        </div>
        {recentOrders.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Ordine</th><th>Cliente</th><th>Stato</th><th>Pagamento</th><th>Totale</th></tr></thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong><small>{order.createdAt}</small></td>
                    <td>{order.email}</td>
                    <td><span className="admin-pill">{order.status}</span></td>
                    <td>{order.paymentStatus}</td>
                    <td>{formatMoney(order.totalCents, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty"><span>00</span><h3>Nessun ordine, per ora.</h3><p>Gli ordini compariranno qui dopo il primo checkout.</p></div>
        )}
      </section>
    </main>
  );
}
