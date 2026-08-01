"use client";

import { useCallback, useEffect, useState } from "react";

type OrderRow = {
  id: string; orderNumber: string; email: string; status: string; paymentStatus: string;
  fulfillmentStatus: string; totalCents: number; currency: string; itemCount: number; createdAt: string;
};

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setOrders(payload.orders ?? []); else setError(payload.error ?? "Errore ordini.");
    setLoading(false);
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const update = async (id: string, field: string, value: string) => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }),
    });
    if (response.ok) await loadOrders();
  };

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p>Vendite</p><h1>Ordini</h1></div></div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p>{orders.length} elementi</p><h2>Registro ordini</h2></div></div>
        {error && <p className="admin-error">{error}</p>}
        {loading ? <p className="admin-loading">Caricamento…</p> : orders.length ? (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Ordine</th><th>Cliente</th><th>Articoli</th><th>Totale</th><th>Stato</th><th>Pagamento</th><th>Spedizione</th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id}>
              <td><strong>{order.orderNumber}</strong><small>{order.createdAt}</small></td><td>{order.email}</td><td>{order.itemCount}</td>
              <td>{new Intl.NumberFormat("it-IT", { style: "currency", currency: order.currency }).format(order.totalCents / 100)}</td>
              <td><select value={order.status} onChange={(e) => void update(order.id, "status", e.target.value)}><option value="pending">In attesa</option><option value="processing">In lavorazione</option><option value="completed">Completato</option><option value="cancelled">Annullato</option></select></td>
              <td><select value={order.paymentStatus} onChange={(e) => void update(order.id, "paymentStatus", e.target.value)}><option value="pending">In attesa</option><option value="paid">Pagato</option><option value="failed">Fallito</option><option value="refunded">Rimborsato</option></select></td>
              <td><select value={order.fulfillmentStatus} onChange={(e) => void update(order.id, "fulfillmentStatus", e.target.value)}><option value="unfulfilled">Da evadere</option><option value="preparing">In preparazione</option><option value="shipped">Spedito</option><option value="delivered">Consegnato</option></select></td>
            </tr>)}</tbody>
          </table></div>
        ) : <div className="admin-empty"><span>00</span><h3>Nessun ordine.</h3><p>Il database è pronto e attende il primo acquisto.</p></div>}
      </section>
    </main>
  );
}
