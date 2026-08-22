"use client";

import { useState } from "react";
import { addLocalCartItem } from "@/lib/local-cart";

type Variant = { id: string; title: string; stockQuantity: number };
type PurchaseProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
};

type ProductPurchaseProps = {
  variants: Variant[];
  product: PurchaseProduct;
  categoryName: string;
  preview?: boolean;
};

export function ProductPurchase({ variants, product, categoryName, preview = false }: ProductPurchaseProps) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"bag" | "checkout" | null>(null);
  const selected = variants.find((variant) => variant.id === variantId);
  const canAdd = Boolean(selected && (preview || selected.stockQuantity > 0));
  const maxQuantity = preview ? 10 : Math.max(1, selected?.stockQuantity ?? 1);

  function selectVariant(nextVariantId: string) {
    setVariantId(nextVariantId);
    setQuantity(1);
    setMessage("");
  }

  async function add(redirectToCheckout = false) {
    if (!selected) return;
    setBusyAction(redirectToCheckout ? "checkout" : "bag");
    setMessage("");

    if (preview) {
      try {
        const cart = addLocalCartItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          imageUrl: product.imageUrl,
          variantId: selected.id,
          variantTitle: selected.title,
          quantity,
          unitPriceCents: product.priceCents,
          currency: "EUR",
        });
        if (redirectToCheckout) {
          window.location.assign("/checkout");
          return;
        }
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        setMessage(`Aggiunto alla borsa. Ora contiene ${itemCount} ${itemCount === 1 ? "articolo" : "articoli"}.`);
      } catch {
        setMessage("Non è stato possibile salvare la borsa su questo dispositivo.");
      } finally {
        setBusyAction(null);
      }
      return;
    }

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
      {preview ? <p className="purchase-preview-note"><span aria-hidden="true">●</span> Borsa preview attiva · disponibilità da confermare</p> : null}
      <fieldset className="variant-picker">
        <legend>{categoryName === "Cinture" ? "Scegli la misura" : "Scegli la taglia"}</legend>
        <div>
          {variants.map((variant) => (
            <label className={variant.id === variantId ? "is-selected" : ""} key={variant.id}>
              <input
                type="radio"
                name="product-variant"
                value={variant.id}
                checked={variant.id === variantId}
                disabled={!preview && variant.stockQuantity < 1}
                onChange={() => selectVariant(variant.id)}
              />
              <span>{variant.title}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="purchase-quantity-row">
        <span>Quantità</span>
        <div className="quantity-stepper">
          <button type="button" aria-label="Riduci quantità" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
          <output aria-live="polite" aria-label={`Quantità ${quantity}`}>{quantity}</output>
          <button type="button" aria-label="Aumenta quantità" disabled={quantity >= maxQuantity} onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}>+</button>
        </div>
      </div>
      <div className="purchase-actions">
        <button className="purchase-add-bag" type="button" disabled={busyAction !== null || !canAdd} onClick={() => void add()}>
          {busyAction === "bag" ? "Aggiunta…" : canAdd ? "Aggiungi alla borsa" : "Non disponibile"}<span>+</span>
        </button>
        <button className="purchase-buy-now" type="button" disabled={busyAction !== null || !canAdd} onClick={() => void add(true)}>
          {busyAction === "checkout" ? "Verso la borsa…" : canAdd ? "Acquista ora" : "Non disponibile"}<span>↗</span>
        </button>
      </div>
      {message ? <p className="purchase-message" role="status">{message} <a href="/checkout">Apri la borsa ↗</a></p> : null}
      <details className="size-guide">
        <summary>Guida taglie e misure <span>+</span></summary>
        <p>
          {categoryName === "Cinture"
            ? "La misura indica indicativamente la distanza in centimetri tra l’estremità della fibbia e il foro centrale."
            : categoryName === "Pantaloni"
              ? "Le taglie indicate seguono la scala italiana. Vestibilità e misure precise saranno confermate nella scheda definitiva."
              : "Guida orientativa: S ≈ IT 46, M ≈ IT 48, L ≈ IT 50, XL ≈ IT 52. Verifica sempre le misure definitive prima dell’acquisto."}
        </p>
      </details>
    </div>
  );
}
