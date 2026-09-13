"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import { useI18n } from "@/components/locale-provider";
import { formatMoney } from "@/lib/store-utils";

export function CartDrawer() {
  const { cart, open, notice, loading, busy, error, closeCart, setQuantity, removeItem } = useCart();
  const { t, localeTag } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) { if (element.open) element.close(); return; }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open]);

  return <dialog ref={dialog} id="store-cart" className="cart-drawer" aria-labelledby="cart-title" onCancel={closeCart} onClick={(event) => {
    if (event.target === event.currentTarget) {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeCart();
    }
  }}>
    <div className="cart-drawer-shell">
      <header className="cart-drawer-header"><div><p>THE SELECTED EDIT</p><h2 id="cart-title">{t("common.cart")} <span>{String(cart.itemCount).padStart(2, "0")}</span></h2></div><button type="button" className="cart-close" onClick={closeCart} aria-label={t("cart.close")} autoFocus>×</button></header>
      {notice ? <p className="cart-added" role="status"><span aria-hidden="true">✓</span>{notice}</p> : null}
      <div className="cart-drawer-body" aria-busy={busy || loading}>
        {loading && !cart.items.length ? <p role="status">{t("cart.loading")}</p> : cart.items.length ? <ul className="cart-drawer-items">{cart.items.map((item) => <li key={item.id}>
          <a className="cart-item-image" aria-label={item.name} href={`/prodotto/${encodeURIComponent(item.slug)}?variant=${encodeURIComponent(item.variantId)}`}>{item.imageUrl ? <Image src={item.imageUrl} width={92} height={116} alt="" unoptimized /> : <span aria-hidden="true">LCS</span>}</a>
          <div className="cart-item-detail"><a className="cart-item-name" href={`/prodotto/${encodeURIComponent(item.slug)}?variant=${encodeURIComponent(item.variantId)}`}>{item.name}</a><p>{item.variantName !== "Standard" ? item.variantName : ""}</p><strong>{formatMoney(item.lineTotalCents, cart.currency, localeTag)}</strong>
            <div className="cart-item-controls"><div className="cart-stepper" role="group" aria-label={t("cart.quantityFor", { name: item.name })}>
              <button type="button" disabled={busy || loading || item.quantity <= 1} onClick={() => void setQuantity(item.id, item.quantity - 1)} aria-label={t("cart.decrease", { name: item.name })}>−</button>
              <span aria-live="polite">{item.quantity}</span>
              <button type="button" disabled={busy || loading || item.quantity >= item.stockQuantity} onClick={() => void setQuantity(item.id, item.quantity + 1)} aria-label={t("cart.increase", { name: item.name })}>+</button>
            </div><button type="button" className="cart-remove" disabled={busy || loading} onClick={() => void removeItem(item.id)} aria-label={t("cart.removeItem", { name: item.name })}>{t("cart.remove")}</button></div>
            {item.quantity >= item.stockQuantity ? <small className="cart-stock-note">{t("cart.maxQuantity")}</small> : null}
          </div>
        </li>)}</ul> : cart.checkoutUrl ? <div className="cart-empty"><h3>{t("stripe.pending")}</h3><p>{t("cart.locked")}</p><a href={cart.checkoutUrl} className="cart-checkout">{t("stripe.resume")} ↗</a></div> : <div className="cart-empty"><span aria-hidden="true">LCS</span><h3>{t("checkout.empty")}</h3><p>{t("cart.emptyCopy")}</p><a href="/shop" className="cart-checkout">{t("checkout.discover")} ↗</a></div>}
      </div>
      {error ? <p className="cart-error" role="alert">{error}</p> : null}
      <footer className="cart-drawer-footer">
        {cart.items.length ? <><div className="cart-subtotal"><span>{t("checkoutV2.subtotal")}</span><strong>{formatMoney(cart.subtotalCents, cart.currency, localeTag)}</strong></div><p className="cart-shipping">{t("cart.shippingCopy")}</p><a href="/checkout" className="cart-checkout" aria-disabled={busy || loading} onClick={(event) => { if (busy || loading) event.preventDefault(); }}>{t("cart.checkout")}<span aria-hidden="true">↗</span></a></> : null}
        <button type="button" className="cart-continue" onClick={closeCart}>{t("cart.continue")}</button>
      </footer>
    </div>
  </dialog>;
}
