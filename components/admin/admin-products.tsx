"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatProductPrice } from "@/lib/store-utils";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  status: string;
  basePriceCents: number;
  currency: string;
  stockQuantity: number;
  imageUrl: string | null;
  createdAt: string;
};

const initialForm = {
  name: "",
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

export function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setProducts(payload.products ?? []);
    else setError(payload.error ?? "Impossibile caricare i prodotti.");
    setLoading(false);
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(payload.error ?? "Salvataggio non riuscito.");
      return;
    }
    setForm(initialForm);
    setShowForm(false);
    await loadProducts();
  };

  const changeStatus = async (product: ProductRow) => {
    const status = product.status === "active" ? "draft" : "active";
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) await loadProducts();
  };

  const remove = async (product: ProductRow) => {
    if (!window.confirm(`Eliminare definitivamente “${product.name}”?`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (response.ok) await loadProducts();
  };

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div><p>Catalogo</p><h1>Prodotti</h1></div>
        <button className="admin-primary-action" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Chiudi" : "+ Nuovo prodotto"}
        </button>
      </div>

      {showForm && (
        <section className="admin-panel admin-form-panel">
          <div className="admin-panel-heading"><div><p>Nuova scheda</p><h2>Dettagli prodotto</h2></div></div>
          <form className="admin-product-form" onSubmit={submit}>
            <label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>SKU<input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} /></label>
            <label>Slug<input value={form.slug} placeholder="generato dal nome" onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
            <label>Categoria<input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} /></label>
            <label>Prezzo (€)<input required inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label>Prezzo precedente (€)<input inputMode="decimal" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} /></label>
            <label>Giacenza<input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></label>
            <label>Taglia<input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></label>
            <label>Colore<input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
            <label>Immagine URL<input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
            <label className="admin-form-wide">Descrizione breve<input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></label>
            <label className="admin-form-wide">Descrizione<textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Stato<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Bozza</option><option value="active">Pubblicato</option></select></label>
            <div className="admin-form-submit"><button disabled={saving} type="submit">{saving ? "Salvataggio…" : "Crea prodotto"}</button></div>
          </form>
          {error && <p className="admin-error" role="alert">{error}</p>}
        </section>
      )}

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p>{products.length} elementi</p><h2>Catalogo</h2></div></div>
        {loading ? <p className="admin-loading">Caricamento…</p> : products.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table admin-products-table">
              <thead><tr><th>Prodotto</th><th>SKU</th><th>Prezzo</th><th>Giacenza</th><th>Stato</th><th>Azioni</th></tr></thead>
              <tbody>{products.map((product) => (
                <tr key={product.id}>
                  <td><div className="admin-product-cell">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>LC</span>}<div><strong>{product.name}</strong><small>/{product.slug}</small></div></div></td>
                  <td>{product.sku}</td>
                  <td>{formatProductPrice(product.basePriceCents, product.currency)}</td>
                  <td>{product.stockQuantity}</td>
                  <td><span className={`admin-pill ${product.status === "active" ? "is-active" : ""}`}>{product.status}</span></td>
                  <td><div className="admin-row-actions"><button onClick={() => void changeStatus(product)}>{product.status === "active" ? "Sospendi" : "Pubblica"}</button><button className="danger" onClick={() => void remove(product)}>Elimina</button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="admin-empty"><span>00</span><h3>Il catalogo è vuoto.</h3><p>Crea il primo prodotto per iniziare.</p></div>}
      </section>
    </main>
  );
}
