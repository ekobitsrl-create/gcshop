"use client";
import { useState } from "react";

type Variant = { id: string; title: string; stockQuantity: number };
export function ProductPurchase({ variants }: { variants: Variant[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? ""); const [quantity, setQuantity] = useState(1); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const add = async () => { setBusy(true); setMessage(""); const response = await fetch("/api/cart", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ variantId, quantity }) }); const payload = await response.json(); setBusy(false); setMessage(response.ok ? `${payload.itemCount} articoli nella borsa.` : payload.error); };
  const selected = variants.find((variant) => variant.id === variantId);
  return <div className="purchase-box">
    <label>Variante<select value={variantId} onChange={(e) => setVariantId(e.target.value)}>{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.title} — {variant.stockQuantity ? `${variant.stockQuantity} disponibili` : "esaurito"}</option>)}</select></label>
    <label>Quantità<input type="number" min="1" max={Math.max(1, selected?.stockQuantity ?? 1)} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} /></label>
    <button type="button" disabled={busy || !selected?.stockQuantity} onClick={() => void add()}>{busy ? "Aggiunta…" : selected?.stockQuantity ? "Aggiungi alla borsa" : "Esaurito"}</button>
    {message && <p role="status">{message} <a href="/checkout">Vai al checkout →</a></p>}
  </div>;
}
