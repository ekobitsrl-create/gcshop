"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrderRow = {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalCents: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  shippingAddressJson: string;
  paymentMethodCode: string;
  shipmentStatus: string | null;
  carrier: string | null;
  trackingNumber: string | null;
};

type OrderDetail = {
  order: OrderRow & {
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    internalNote: string | null;
    customerNote: string | null;
  };
  items: Array<{ id: string; productName: string; variantName: string | null; sku: string; quantity: number; unitPriceCents: number; totalCents: number }>;
  shipments: Array<{ id: string; status: string; carrier: string | null; service: string | null; trackingNumber: string | null; trackingUrl: string | null; labelUrl: string | null; note: string | null; shippedAt: string | null; deliveredAt: string | null }>;
  transactions: Array<{ id: string; paymentMethodCode: string; status: string; providerReference: string | null; amountCents: number; createdAt: string }>;
};

const emptyShipment = { status: "preparing", carrier: "", service: "", trackingNumber: "", trackingUrl: "", labelUrl: "", note: "" };

function money(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function addressFrom(value: string) {
  try {
    return JSON.parse(value) as { recipientName?: string; addressLine1?: string; postalCode?: string; city?: string; province?: string; countryCode?: string };
  } catch {
    return {};
  }
}

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [shipment, setShipment] = useState(emptyShipment);
  const [internalNote, setInternalNote] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setOrders(payload.orders ?? []);
    else setError(payload.error ?? "Errore durante il caricamento degli ordini.");
    setLoading(false);
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) {
      setDetail(payload);
      const current = payload.shipments?.[0];
      setShipment(current ? {
        status: current.status || "preparing",
        carrier: current.carrier || "",
        service: current.service || "",
        trackingNumber: current.trackingNumber || "",
        trackingUrl: current.trackingUrl || "",
        labelUrl: current.labelUrl || "",
        note: current.note || "",
      } : emptyShipment);
      setInternalNote(payload.order.internalNote || "");
    } else setError(payload.error ?? "Dettaglio ordine non disponibile.");
    setDetailLoading(false);
  }

  async function update(id: string, body: Record<string, unknown>, refreshDetail = false) {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) setError(payload.error ?? "Aggiornamento non riuscito.");
    else {
      await loadOrders();
      if (refreshDetail) await openDetail(id);
    }
    setSaving(false);
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("it-IT");
    if (!term) return orders;
    return orders.filter((order) => `${order.orderNumber} ${order.email} ${order.trackingNumber ?? ""}`.toLocaleLowerCase("it-IT").includes(term));
  }, [orders, query]);

  const stats = useMemo(() => ({
    open: orders.filter((order) => !["completed", "cancelled"].includes(order.status)).length,
    paid: orders.filter((order) => order.paymentStatus === "paid").length,
    shipping: orders.filter((order) => ["preparing", "shipped"].includes(order.fulfillmentStatus)).length,
    revenue: orders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.totalCents, 0),
  }), [orders]);

  return (
    <main className="admin-page admin-orders-page">
      <div className="admin-page-heading"><div><p>Vendite / Fulfillment</p><h1>Ordini</h1><span className="admin-heading-note">Dal pagamento alla consegna, senza perdere un passaggio.</span></div></div>

      <section className="admin-metrics">
        <article><span>01</span><p>Da lavorare</p><strong>{stats.open}</strong><small>ordini aperti</small></article>
        <article><span>02</span><p>Pagati</p><strong>{stats.paid}</strong><small>pagamenti confermati</small></article>
        <article><span>03</span><p>In spedizione</p><strong>{stats.shipping}</strong><small>da preparare o spediti</small></article>
        <article><span>04</span><p>Incassato</p><strong className="admin-money-metric">{money(stats.revenue)}</strong><small>ordini pagati</small></article>
      </section>

      <section className="admin-panel admin-orders-panel">
        <div className="admin-catalog-toolbar">
          <label className="admin-search"><span>Cerca</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ordine, cliente o tracking…" /></label>
          <div className="admin-results-count"><strong>{filtered.length}</strong><span>ordini</span></div>
        </div>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? <div className="admin-loading-state"><span /><p>Carico gli ordini…</p></div> : filtered.length ? (
          <div className="admin-table-wrap"><table className="admin-table admin-orders-table">
            <thead><tr><th>Ordine</th><th>Cliente</th><th>Totale</th><th>Ordine</th><th>Pagamento</th><th>Spedizione</th><th /></tr></thead>
            <tbody>{filtered.map((order) => <tr key={order.id}>
              <td><button className="admin-order-number" onClick={() => void openDetail(order.id)}><strong>{order.orderNumber}</strong><small>{date(order.createdAt)} · {order.itemCount} pz</small></button></td>
              <td><strong>{order.email}</strong><small>{order.phone ?? "Telefono non indicato"}</small></td>
              <td><strong>{money(order.totalCents, order.currency)}</strong><small>{order.paymentMethodCode}</small></td>
              <td><select className={`admin-status-select is-${order.status}`} value={order.status} onChange={(event) => void update(order.id, { status: event.target.value })}><option value="pending">In attesa</option><option value="processing">In lavorazione</option><option value="completed">Completato</option><option value="cancelled">Annullato</option></select></td>
              <td><select className={`admin-status-select is-${order.paymentStatus}`} value={order.paymentStatus} onChange={(event) => void update(order.id, { paymentStatus: event.target.value })}><option value="pending">In attesa</option><option value="paid">Pagato</option><option value="failed">Fallito</option><option value="refunded">Rimborsato</option></select></td>
              <td><div className="admin-shipment-cell"><span className={`admin-pill is-${order.fulfillmentStatus}`}>{order.fulfillmentStatus}</span>{order.trackingNumber ? <small>{order.carrier ?? "Corriere"} · {order.trackingNumber}</small> : <small>Tracking da inserire</small>}</div></td>
              <td><button className="admin-manage-button" onClick={() => void openDetail(order.id)}>Gestisci →</button></td>
            </tr>)}</tbody>
          </table></div>
        ) : <div className="admin-empty"><span>00</span><h3>Nessun ordine.</h3><p>Checkout e database sono pronti per il primo acquisto.</p></div>}
      </section>

      {(detail || detailLoading) && <div className="admin-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
        <aside className="admin-order-drawer" aria-label="Gestione ordine">
          <header><div><p>Ordine</p><h2>{detail?.order.orderNumber ?? "Caricamento…"}</h2><span>{detail ? date(detail.order.createdAt) : null}</span></div><button aria-label="Chiudi" onClick={() => setDetail(null)}>×</button></header>
          {detailLoading && !detail ? <div className="admin-loading-state"><span /><p>Carico tutti i dettagli…</p></div> : detail ? <>
            <section className="admin-order-progress" aria-label="Avanzamento ordine">
              {[["paid", "Pagamento"], ["preparing", "Preparazione"], ["shipped", "Spedizione"], ["delivered", "Consegna"]].map(([step, label], index) => {
                const stage = detail.order.fulfillmentStatus;
                const progress = stage === "delivered" ? 4 : stage === "shipped" ? 3 : stage === "preparing" ? 2 : detail.order.paymentStatus === "paid" ? 1 : 0;
                return <div className={index < progress ? "is-complete" : ""} key={step}><span>{index + 1}</span><small>{label}</small></div>;
              })}
            </section>
            <section className="admin-order-columns">
              <div><p className="admin-eyebrow">Cliente e consegna</p>{(() => { const address = addressFrom(detail.order.shippingAddressJson); return <address><strong>{address.recipientName ?? detail.order.email}</strong><span>{address.addressLine1}</span><span>{address.postalCode} {address.city} {address.province ? `(${address.province})` : ""}</span><span>{address.countryCode}</span><a href={`mailto:${detail.order.email}`}>{detail.order.email}</a><a href={`tel:${detail.order.phone ?? ""}`}>{detail.order.phone}</a></address>; })()}</div>
              <div><p className="admin-eyebrow">Riepilogo</p><dl><div><dt>Subtotale</dt><dd>{money(detail.order.subtotalCents)}</dd></div><div><dt>Sconto</dt><dd>− {money(detail.order.discountCents)}</dd></div><div><dt>Spedizione</dt><dd>{money(detail.order.shippingCents)}</dd></div><div className="is-total"><dt>Totale</dt><dd>{money(detail.order.totalCents)}</dd></div></dl></div>
            </section>
            <section className="admin-order-items"><div className="admin-section-heading"><div><p>Contenuto</p><h3>Articoli ordinati</h3></div></div>{detail.items.map((item) => <article key={item.id}><div><strong>{item.productName}</strong><small>{item.variantName ?? "Standard"} · {item.sku}</small></div><span>{item.quantity} × {money(item.unitPriceCents)}</span><strong>{money(item.totalCents)}</strong></article>)}</section>
            <section className="admin-shipment-form"><div className="admin-section-heading"><div><p>Fulfillment</p><h3>Spedizione e tracking</h3></div><span>Il tracking resta associato all’ordine.</span></div>
              <div className="admin-shipment-grid">
                <label>Stato<select value={shipment.status} onChange={(event) => setShipment({ ...shipment, status: event.target.value })}><option value="preparing">In preparazione</option><option value="shipped">Spedito</option><option value="delivered">Consegnato</option><option value="exception">Problema</option><option value="returned">Reso</option></select></label>
                <label>Corriere<input value={shipment.carrier} placeholder="DHL, UPS, BRT…" onChange={(event) => setShipment({ ...shipment, carrier: event.target.value })} /></label>
                <label>Servizio<input value={shipment.service} placeholder="Express" onChange={(event) => setShipment({ ...shipment, service: event.target.value })} /></label>
                <label>Tracking<input value={shipment.trackingNumber} onChange={(event) => setShipment({ ...shipment, trackingNumber: event.target.value })} /></label>
                <label className="admin-form-wide">URL tracking<input type="url" value={shipment.trackingUrl} onChange={(event) => setShipment({ ...shipment, trackingUrl: event.target.value })} /></label>
                <label className="admin-form-wide">Note spedizione<textarea rows={3} value={shipment.note} onChange={(event) => setShipment({ ...shipment, note: event.target.value })} /></label>
              </div>
              <button className="admin-primary-action" disabled={saving} onClick={() => void update(detail.order.id, { shipment }, true)}>{saving ? "Salvataggio…" : "Salva spedizione"}</button>
            </section>
            <section className="admin-internal-note"><label>Nota interna<textarea rows={4} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} /></label><button disabled={saving} onClick={() => void update(detail.order.id, { internalNote }, true)}>Salva nota</button></section>
          </> : null}
        </aside>
      </div>}
    </main>
  );
}
