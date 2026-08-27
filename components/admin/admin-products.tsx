"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  sku: string;
  slug: string;
  status: string;
  basePriceCents: number;
  compareAtPriceCents: number | null;
  supplierRetailPriceCents: number | null;
  supplierCostCents: number | null;
  priceLocked: boolean;
  catalogSource: string;
  currency: string;
  stockQuantity: number;
  supplierStockQuantity: number;
  variantCount: number;
  lowStockCount: number;
  imageUrl: string | null;
};

type Variant = {
  id: string;
  title: string;
  sku: string;
  supplierCode: string | null;
  barcode: string | null;
  size: string | null;
  color: string | null;
  priceCents: number | null;
  supplierCostCents: number | null;
  stockQuantity: number;
  supplierStockQuantity: number;
  stockLocked: boolean;
  isActive: boolean;
};

type ProductDetail = {
  product: ProductRow & {
    description: string | null;
    shortDescription: string | null;
    originCountry: string | null;
    weightGrams: number | null;
    lastSyncedAt: string | null;
  };
  categoryName: string | null;
  images: Array<{ id: string; url: string; altText: string | null }>;
  variants: Variant[];
};

type CatalogPayload = {
  products: ProductRow[];
  pagination: { page: number; pages: number; total: number; pageSize: number };
  stats: { total: number; active: number; draft: number; units: number; lowStock: number };
  latestImport: null | {
    status: string;
    completedAt: string | null;
    sourceLastUpdate: string | null;
    productsImported: number;
  };
};

const initialForm = {
  name: "",
  brand: "",
  gender: "unisex",
  sku: "",
  slug: "",
  categoryName: "",
  price: "",
  compareAtPrice: "",
  stockQuantity: "0",
  size: "Standard",
  color: "",
  imageUrl: "",
  shortDescription: "",
  description: "",
  status: "draft",
};

function euro(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminProducts() {
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), status, limit: "40" });
    if (query.trim()) params.set("q", query.trim());
    const response = await fetch(`/api/admin/products?${params}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) setPayload(result);
    else setError(result.error ?? "Impossibile caricare i prodotti.");
    setLoading(false);
  }, [page, query, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadProducts(), query ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [loadProducts, query]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    const response = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) {
      setDetail(result);
      setStockDrafts(Object.fromEntries(result.variants.map((variant: Variant) => [variant.id, String(variant.stockQuantity)])));
    } else setError(result.error ?? "Dettaglio prodotto non disponibile.");
    setDetailLoading(false);
  }

  async function mutateProduct(id: string, body: Record<string, unknown>, close = false) {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "Salvataggio non riuscito.");
    else {
      await loadProducts();
      if (detail?.product.id === id && !close) await openDetail(id);
      if (close) setDetail(null);
    }
    setSaving(false);
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? "Salvataggio non riuscito.");
      return;
    }
    setForm(initialForm);
    setShowForm(false);
    await loadProducts();
  }

  async function archive(product: ProductRow) {
    if (!window.confirm(`Archiviare “${product.name}”? Il prodotto non sarà più visibile nello shop.`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (response.ok) await loadProducts();
  }

  const products = payload?.products ?? [];
  const stats = payload?.stats;

  return (
    <main className="admin-page admin-catalog-page">
      <div className="admin-page-heading">
        <div><p>Catalogo / Operations</p><h1>Prodotti</h1><span className="admin-heading-note">Prezzi, disponibilità e schede in un solo spazio.</span></div>
        <button className="admin-primary-action" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Chiudi inserimento" : "+ Prodotto manuale"}
        </button>
      </div>

      <section className="admin-metrics admin-metrics-five" aria-label="Riepilogo catalogo">
        <article><span>01</span><p>Catalogo</p><strong>{stats?.total ?? "—"}</strong><small>prodotti complessivi</small></article>
        <article><span>02</span><p>Online</p><strong>{stats?.active ?? "—"}</strong><small>pubblicati nello shop</small></article>
        <article><span>03</span><p>Unità</p><strong>{stats?.units ?? "—"}</strong><small>disponibilità totale</small></article>
        <article><span>04</span><p>Scorte basse</p><strong>{stats?.lowStock ?? "—"}</strong><small>varianti da seguire</small></article>
        <article className="admin-import-metric"><span>Feed</span><p>Romanelli</p><strong>{payload?.latestImport?.status === "completed" ? "OK" : "—"}</strong><small>Aggiornato {date(payload?.latestImport?.completedAt)}</small></article>
      </section>

      {showForm && (
        <section className="admin-panel admin-form-panel">
          <div className="admin-panel-heading"><div><p>Inserimento diretto</p><h2>Nuova scheda prodotto</h2></div></div>
          <form className="admin-product-form" onSubmit={createProduct}>
            <label>Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Brand<input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} /></label>
            <label>SKU<input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value.toUpperCase() })} /></label>
            <label>Categoria<input value={form.categoryName} onChange={(event) => setForm({ ...form, categoryName: event.target.value })} /></label>
            <label>Genere<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option value="donna">Donna</option><option value="uomo">Uomo</option><option value="unisex">Unisex</option><option value="junior">Junior</option></select></label>
            <label>Slug<input value={form.slug} placeholder="generato dal nome" onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
            <label>Prezzo pubblico (€)<input required inputMode="decimal" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
            <label>Prezzo precedente (€)<input inputMode="decimal" value={form.compareAtPrice} onChange={(event) => setForm({ ...form, compareAtPrice: event.target.value })} /></label>
            <label>Giacenza<input type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} /></label>
            <label>Taglia<input value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></label>
            <label>Colore<input value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
            <label>Immagine URL<input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></label>
            <label className="admin-form-wide">Descrizione breve<input value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} /></label>
            <label className="admin-form-wide">Descrizione<textarea rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label>Stato<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="draft">Bozza</option><option value="active">Pubblicato</option></select></label>
            <div className="admin-form-submit"><button disabled={saving} type="submit">{saving ? "Salvataggio…" : "Crea prodotto"}</button></div>
          </form>
        </section>
      )}

      <section className="admin-panel admin-catalog-panel">
        <div className="admin-catalog-toolbar">
          <label className="admin-search"><span>Cerca</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Nome, brand, SKU…" /></label>
          <label><span>Stato</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">Tutti</option><option value="active">Online</option><option value="draft">Bozza</option><option value="archived">Archiviati</option></select></label>
          <div className="admin-results-count"><strong>{payload?.pagination.total ?? 0}</strong><span>risultati</span></div>
        </div>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? <div className="admin-loading-state"><span /><p>Sto caricando il catalogo…</p></div> : products.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table admin-products-table">
              <thead><tr><th>Prodotto</th><th>Prezzo pubblico</th><th>Costo fornitore</th><th>Disponibilità</th><th>Stato</th><th /></tr></thead>
              <tbody>{products.map((product) => {
                const priceValue = priceDrafts[product.id] ?? (product.basePriceCents / 100).toFixed(2);
                const margin = product.supplierCostCents && product.basePriceCents
                  ? Math.round(((product.basePriceCents - product.supplierCostCents) / product.basePriceCents) * 100)
                  : null;
                return (
                  <tr key={product.id}>
                    <td><button className="admin-product-cell admin-product-button" type="button" onClick={() => void openDetail(product.id)}>
                      <span className="admin-product-thumb">{product.imageUrl ? <Image src={product.imageUrl} alt="" fill unoptimized sizes="56px" /> : <b>LC</b>}</span>
                      <span><small>{product.brand ?? "LCS"} · {product.catalogSource}</small><strong>{product.name}</strong><em>{product.sku} · {product.variantCount} varianti</em></span>
                    </button></td>
                    <td><div className="admin-inline-price"><span>€</span><input aria-label={`Prezzo ${product.name}`} inputMode="decimal" value={priceValue} onChange={(event) => setPriceDrafts({ ...priceDrafts, [product.id]: event.target.value })} /><button disabled={saving} onClick={() => void mutateProduct(product.id, { price: priceValue })}>Salva</button></div>{product.priceLocked ? <button className="admin-sync-link" onClick={() => void mutateProduct(product.id, { resetPrice: true })}>Ripristina feed</button> : <small className="admin-synced-label">Sincronizzato</small>}</td>
                    <td><strong>{euro(product.supplierCostCents)}</strong>{margin !== null ? <small>Margine lordo {margin}%</small> : null}</td>
                    <td><strong>{product.stockQuantity}</strong><small>{product.variantCount} varianti · feed {product.supplierStockQuantity}</small>{product.lowStockCount ? <span className="admin-stock-alert">{product.lowStockCount} basse</span> : null}</td>
                    <td><select className={`admin-status-select is-${product.status}`} value={product.status} onChange={(event) => void mutateProduct(product.id, { status: event.target.value })}><option value="active">Online</option><option value="draft">Bozza</option><option value="archived">Archiviato</option></select></td>
                    <td><div className="admin-row-actions"><a href={`/prodotto/${product.slug}`} target="_blank" rel="noreferrer">Vedi ↗</a><button onClick={() => void openDetail(product.id)}>Gestisci</button><button className="danger" onClick={() => void archive(product)}>Archivia</button></div></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : <div className="admin-empty"><span>00</span><h3>Nessun prodotto trovato.</h3><p>Prova a modificare ricerca o stato.</p></div>}
        {payload && payload.pagination.pages > 1 ? <nav className="admin-pagination" aria-label="Pagine catalogo"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Precedente</button><span>Pagina {page} di {payload.pagination.pages}</span><button disabled={page >= payload.pagination.pages} onClick={() => setPage((value) => value + 1)}>Successiva →</button></nav> : null}
      </section>

      {(detail || detailLoading) && <div className="admin-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
        <aside className="admin-product-drawer" aria-label="Gestione prodotto">
          <header><div><p>Scheda operativa</p><h2>{detail?.product.name ?? "Caricamento…"}</h2></div><button aria-label="Chiudi" onClick={() => setDetail(null)}>×</button></header>
          {detailLoading && !detail ? <div className="admin-loading-state"><span /><p>Carico varianti e immagini…</p></div> : detail ? <>
            <div className="admin-drawer-gallery">{detail.images.slice(0, 4).map((image) => <div key={image.id}><Image src={image.url} alt={image.altText ?? detail.product.name} fill unoptimized sizes="180px" /></div>)}</div>
            <section className="admin-drawer-summary"><div><span>Brand</span><strong>{detail.product.brand ?? "—"}</strong></div><div><span>Categoria</span><strong>{detail.categoryName ?? "—"}</strong></div><div><span>Origine</span><strong>{detail.product.originCountry ?? "—"}</strong></div><div><span>Ultimo feed</span><strong>{date(detail.product.lastSyncedAt)}</strong></div></section>
            <section className="admin-drawer-copy"><p>{detail.product.description || detail.product.shortDescription || "Nessuna descrizione."}</p></section>
            <section className="admin-variant-section"><div className="admin-section-heading"><div><p>Disponibilità</p><h3>{detail.variants.length} varianti</h3></div><span>Le modifiche manuali restano protette dal prossimo feed.</span></div>
              <div className="admin-variant-list">{detail.variants.map((variant) => <article key={variant.id} className={!variant.isActive ? "is-inactive" : ""}>
                <div><strong>{variant.title}</strong><small>{variant.supplierCode ?? variant.sku}</small>{variant.barcode ? <em>EAN {variant.barcode}</em> : null}</div>
                <div className="admin-variant-price"><span>Prezzo</span><strong>{euro(variant.priceCents)}</strong><small>Costo {euro(variant.supplierCostCents)}</small></div>
                <label><span>Giacenza</span><input type="number" min="0" value={stockDrafts[variant.id] ?? String(variant.stockQuantity)} onChange={(event) => setStockDrafts({ ...stockDrafts, [variant.id]: event.target.value })} /></label>
                <div className="admin-variant-actions"><button disabled={saving} onClick={() => void mutateProduct(detail.product.id, { variantId: variant.id, stockQuantity: Number(stockDrafts[variant.id] ?? variant.stockQuantity) })}>Salva</button>{variant.stockLocked ? <button className="admin-sync-link" onClick={() => void mutateProduct(detail.product.id, { variantId: variant.id, resetStock: true })}>Usa feed ({variant.supplierStockQuantity})</button> : <small>Feed: {variant.supplierStockQuantity}</small>}</div>
              </article>)}</div>
            </section>
          </> : null}
        </aside>
      </div>}
    </main>
  );
}
