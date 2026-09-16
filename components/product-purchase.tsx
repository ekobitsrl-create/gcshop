"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/store-utils";
import { useI18n } from "@/components/locale-provider";
import { useCart } from "@/components/cart-provider";

type Variant = {
  id: string;
  title: string;
  size: string | null;
  color: string | null;
  priceCents: number | null;
  compareAtPriceCents: number | null;
  stockQuantity: number;
};

export function ProductPurchase({
  variants,
  defaultVariantId,
  basePriceCents,
  compareAtPriceCents,
  currency,
}: {
  variants: Variant[];
  defaultVariantId?: string;
  basePriceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
}) {
  const { localeTag, t } = useI18n();
  const { addItem, busy, error } = useCart();
  const firstAvailable = variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
  const initialVariant = variants.find((variant) => variant.id === defaultVariantId) ?? firstAvailable;
  const [variantId, setVariantId] = useState(initialVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [busyAction, setBusyAction] = useState<"bag" | "checkout" | null>(null);
  const selected = variants.find((variant) => variant.id === variantId) ?? firstAvailable;
  const price = selected?.priceCents ?? basePriceCents;
  const comparePrice = selected?.compareAtPriceCents ?? compareAtPriceCents;
  const discount = comparePrice && comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : null;
  const sizes = useMemo(() => variants.map((variant) => ({ ...variant, label: variant.size || variant.title })), [variants]);

  function selectVariant(id: string) {
    setVariantId(id);
    setQuantity(1);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", id);
    window.history.replaceState(null, "", url);
  }

  async function add(redirectToCheckout = false) {
    if (busyAction || busy) return;
    setBusyAction(redirectToCheckout ? "checkout" : "bag");
    try {
      const added = await addItem(variantId, quantity, !redirectToCheckout);
      if (added && redirectToCheckout) {
        window.location.assign("/checkout");
      }
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="purchase-box">
      <div className="product-price-block">
        <p className="product-price">{formatMoney(price, currency, localeTag)}</p>
        {comparePrice && comparePrice > price ? <><del>{formatMoney(comparePrice, currency, localeTag)}</del><span>−{discount}%</span></> : null}
      </div>
      {selected?.color ? <p className="selected-color"><span>{t("product.color")}</span><strong>{selected.color}</strong></p> : null}
      <div className="variant-heading"><span>{t("purchase.selectSize")}</span><a href="/guida-taglie" target="_blank" rel="noopener noreferrer">{t("purchase.sizeGuide")}</a></div>
      <div className="variant-options" role="radiogroup" aria-label={t("purchase.variants")}>
        {sizes.map((variant) => (
          <button
            aria-checked={variant.id === variantId}
            className={variant.id === variantId ? "is-selected" : ""}
            disabled={busy || !variant.stockQuantity}
            key={variant.id}
            onClick={() => selectVariant(variant.id)}
            role="radio"
            type="button"
          >
            <span>{variant.label}</span><small>{variant.stockQuantity ? (variant.stockQuantity <= 2 ? t("purchase.last", { count: variant.stockQuantity }) : t("common.available")) : t("common.soldOut")}</small>
          </button>
        ))}
      </div>
      <div className="purchase-fields">
        <label htmlFor="product-quantity">{t("purchase.quantity")}
          <select id="product-quantity" value={quantity} disabled={busy} onChange={(event) => setQuantity(Number(event.target.value))}>
            {Array.from({ length: Math.min(10, selected?.stockQuantity ?? 1) }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <span className="availability-note"><b />{selected?.stockQuantity ? t("purchase.ready") : t("common.notAvailable")}</span>
      </div>
      <div className="purchase-actions">
        <button className="purchase-buy-now" type="button" disabled={busy || busyAction !== null || !selected?.stockQuantity} onClick={() => void add(true)}>
          {busyAction === "checkout" ? t("purchase.toCheckout") : selected?.stockQuantity ? t("purchase.buyNow") : t("common.notAvailable")}<span>↗</span>
        </button>
        <button className="purchase-add-bag" type="button" disabled={busy || busyAction !== null || !selected?.stockQuantity} onClick={() => void add()}>
          {busyAction === "bag" ? t("purchase.adding") : selected?.stockQuantity ? t("purchase.addCart") : t("common.notAvailable")}<span>+</span>
        </button>
      </div>
      {error ? <p role="alert">{error} <a href="/checkout">{t("purchase.goCheckout")} ↗</a></p> : null}
    </div>
  );
}
