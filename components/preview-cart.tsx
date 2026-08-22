"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LOCAL_CART_EVENT,
  type LocalCartItem,
  readLocalCart,
  removeLocalCartItem,
  updateLocalCartItem,
} from "@/lib/local-cart";
import { formatMoney } from "@/lib/store-utils";

export function PreviewCart() {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readLocalCart());
    const timer = window.setTimeout(() => {
      sync();
      setReady(true);
    }, 0);
    window.addEventListener(LOCAL_CART_EVENT, sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LOCAL_CART_EVENT, sync);
    };
  }, []);

  if (!ready) {
    return <div className="commerce-empty checkout-empty"><p>Caricamento del carrello…</p></div>;
  }

  if (!items.length) {
    return (
      <div className="commerce-empty checkout-empty">
        <div><p className="commerce-kicker">Il carrello è vuoto</p><h2>Non hai ancora aggiunto prodotti.</h2><Link href="/shop">Vai allo shop <span>→</span></Link></div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);

  return (
    <div className="preview-cart-layout">
      <section className="preview-cart-items" aria-labelledby="preview-cart-title">
        <div className="preview-cart-heading">
          <div><p className="commerce-kicker">Carrello</p><h2 id="preview-cart-title">La tua selezione</h2></div>
          <span>{items.reduce((sum, item) => sum + item.quantity, 0)} articoli</span>
        </div>
        {items.map((item) => (
          <article className="preview-cart-item" key={item.key}>
            <Link className="preview-cart-image" href={`/prodotto/${item.slug}`}>
              <Image src={item.imageUrl} alt="" fill unoptimized sizes="130px" />
            </Link>
            <div className="preview-cart-copy">
              <p>{item.brand}</p>
              <h3><Link href={`/prodotto/${item.slug}`}>{item.name}</Link></h3>
              <span>Taglia / misura: {item.variantTitle}</span>
              <div className="preview-cart-controls">
                <label>Quantità
                  <select value={item.quantity} onChange={(event) => setItems(updateLocalCartItem(item.key, Number(event.target.value)))}>
                    {Array.from({ length: 20 }, (_, index) => index + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                  </select>
                </label>
                <button type="button" onClick={() => setItems(removeLocalCartItem(item.key))}>Rimuovi</button>
              </div>
            </div>
            <strong>{formatMoney(item.unitPriceCents * item.quantity, item.currency)}</strong>
          </article>
        ))}
      </section>

      <aside className="preview-cart-summary">
        <p className="commerce-kicker">Riepilogo</p>
        <div><span>Subtotale</span><strong>{formatMoney(subtotal, "EUR")}</strong></div>
        <div><span>Spedizione standard</span><strong>Gratuita</strong></div>
        <div className="preview-cart-total"><span>Totale indicativo</span><strong>{formatMoney(subtotal, "EUR")}</strong></div>
        <p>
          Il carrello funziona su questo dispositivo. Il pagamento resta disattivato finché i dati del
          venditore e le schede prodotto definitive non saranno completati.
        </p>
        <button type="button" disabled>Pagamento in attivazione</button>
        <Link href="/shop">Continua lo shopping</Link>
      </aside>
    </div>
  );
}
