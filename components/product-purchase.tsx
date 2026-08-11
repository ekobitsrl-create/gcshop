"use client";

import { useState } from "react";

type Variant = { id: string; title: string; stockQuantity: number };

export function ProductPurchase({ variants }: { variants: Variant[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"bag" | "checkout" | null>(null);
  const selected = variants.find((variant) => variant.id === variantId);

  async function add(redirectToCheckout = false) {
    setBusyAction(redirectToCheckout ? "checkout" : "bag");
    setMessage("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Non è stato possibile aggiornare la borsa.");
        return;
      }

      if (redirectToCheckout) {
        window.location.assign("/checkout");
        return;
      }

      setMessage(`${payload.itemCount} articoli nella borsa.`);
    } catch {
      setMessage("Connessione non disponibile. Riprova tra poco.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="purchase-box">
      <div className="purchase-fields">
        <label htmlFor="product-variant">Variante
          <select id="product-variant" value={variantId} onChange={(event) => setVariantId(event.target.value)}>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>{variant.title} — {variant.stockQuantity ? `${variant.stockQuantity} disponibili` : "esaurito"}</option>
            ))}
          </select>
        </label>
        <label htmlFor="product-quantity">Quantità
          <input id="product-quantity" type="number" min="1" max={Math.max(1, selected?.stockQuantity ?? 1)} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} />
        </label>
      </div>
      <div className="purchase-actions">
        <button className="purchase-buy-now" type="button" disabled={busyAction !== null || !selected?.stockQuantity} onClick={() => void add(true)}>
          {busyAction === "checkout" ? "Verso il checkout…" : selected?.stockQuantity ? "Acquista ora" : "Non disponibile"}<span>↗</span>
        </button>
        <button className="purchase-add-bag" type="button" disabled={busyAction !== null || !selected?.stockQuantity} onClick={() => void add()}>
          {busyAction === "bag" ? "Aggiunta…" : selected?.stockQuantity ? "Aggiungi alla borsa" : "Non disponibile"}<span>+</span>
        </button>
      </div>
      {message ? <p role="status">{message} <a href="/checkout">Vai al checkout ↗</a></p> : null}
    </div>
  );
}
