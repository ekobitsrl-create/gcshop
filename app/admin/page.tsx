import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { customers, orders, products, productVariants } from "@/db/schema";
import { formatMoney } from "@/lib/store-utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = getDb();
  const [productCount, orderCount, customerCount, lowStockCount, recentOrders] = await Promise.all([
    db.select({ value: sql<number>`count(*)` }).from(products),
    db.select({ value: sql<number>`count(*)` }).from(orders),
    db.select({ value: sql<number>`count(*)` }).from(customers),
    db
      .select({ value: sql<number>`count(*)` })
      .from(productVariants)
      .where(sql`${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold}`),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);

  const cards = [
    { label: "Prodotti", value: productCount[0]?.value ?? 0, note: "nel catalogo" },
    { label: "Ordini", value: orderCount[0]?.value ?? 0, note: "totali" },
    { label: "Clienti", value: customerCount[0]?.value ?? 0, note: "registrati" },
    { label: "Scorte basse", value: lowStockCount[0]?.value ?? 0, note: "da verificare" },
  ];

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div><p>Luxury Concept Store</p><h1>Buon lavoro.</h1></div>
        <a className="admin-primary-action" href="/admin/prodotti">+ Nuovo prodotto</a>
      </div>

      <section className="admin-metrics" aria-label="Riepilogo negozio">
        {cards.map((card, index) => (
          <article key={card.label}>
            <span>0{index + 1}</span><p>{card.label}</p><strong>{card.value}</strong><small>{card.note}</small>
          </article>
        ))}
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
