"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { clearComparison, removeComparedProduct, useComparison } from "@/components/comparison-store";
import { comparePrices, type ComparisonProduct } from "@/lib/product-comparison";
import { formatMoney } from "@/lib/store-utils";

type Result = { key: string; products: ComparisonProduct[]; error: boolean };
const productHref = (product: ComparisonProduct) => `/prodotto/${product.slug}${product.cheapestVariantId ? `?variant=${product.cheapestVariantId}` : ""}`;

export function ComparisonPanel() {
  const { items, ready, notice } = useComparison();
  const { locale, localeTag, t } = useI18n();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const ids = items.map((item) => item.id).join(",");
  const key = `${locale}:${ids}:${attempt}`;

  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    fetch(`/api/products/compare?ids=${encodeURIComponent(ids)}`, { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<{ products: ComparisonProduct[] }>; })
      .then((data) => { if (!controller.signal.aborted) setResult({ key, products: data.products, error: false }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ key, products: [], error: true }); });
    return () => controller.abort();
  }, [ids, key]);

  if (!ready) return <p className="compare-loading" role="status">{t("compare.loading")}</p>;
  if (!items.length) return <section className="compare-empty">
    <span className="compare-empty-index" aria-hidden="true">01 <i>/</i> 02</span>
    <h2>{t("compare.empty")}</h2><p>{t("compare.emptyCopy")}</p><a href="/shop" className="compare-primary">{t("compare.browse")} <span aria-hidden="true">↗</span></a>
  </section>;

  const loading = result?.key !== key;
  const products = loading ? [] : result.products;
  const verdict = comparePrices(products);
  const slots = [items[0], items[1]];
  const columns = slots.map((item) => products.find((product) => product.id === item?.id));
  const money = (cents: number, currency: string) => formatMoney(cents, currency, localeTag);
  const details: { key: string; label: string; value: (product: ComparisonProduct) => string | null }[] = [
    { key: "brand", label: t("compare.brand"), value: (product) => product.brand },
    { key: "category", label: t("compare.category"), value: (product) => product.category },
    { key: "color", label: t("product.color"), value: (product) => product.color },
    { key: "composition", label: t("product.composition"), value: (product) => product.composition },
    { key: "sizes", label: t("compare.sizes"), value: (product) => product.sizes.join(" · ") || (product.inStock ? null : t("compare.soldOut")) },
    { key: "availability", label: t("compare.availability"), value: (product) => t(product.inStock ? "compare.inStock" : "compare.soldOut") },
    { key: "season", label: t("product.season"), value: (product) => product.season },
    { key: "origin", label: t("product.madeIn"), value: (product) => product.originCountry },
  ];

  return <section className="compare-content" aria-label={t("compare.label")}>
    <div className="compare-toolbar"><a href="/shop">← {t("compare.back")}</a><button type="button" onClick={clearComparison}>{t("compare.clear")} ({items.length}/2)</button></div>
    <p className="compare-announcement" role="status" aria-atomic="true">{notice ? t(notice) : ""}</p>
    {loading ? <p className="compare-loading" role="status">{t("compare.loading")}</p> : result.error ? <div className="compare-error" role="alert"><p>{t("compare.loadError")}</p><button className="compare-primary" type="button" onClick={() => setAttempt((current) => current + 1)}>{t("compare.retry")}</button></div> : <>
      {verdict.kind === "equal" ? <p className="compare-verdict">{t("compare.equal")}</p> : null}
      <table className="compare-table">
        <caption className="compare-announcement">{t("compare.label")}</caption>
        <thead><tr>
          <td className="compare-corner"><span>01 / 02</span><p>{t("compare.label")}</p></td>
          {slots.map((selection, index) => {
            const product = columns[index];
            const winner = product && verdict.kind === "winner" && verdict.winnerId === product.id;
            return <th scope="col" id={`compare-product-${index}`} className={winner ? "compare-product is-winner" : "compare-product"} key={selection?.id ?? "empty"}>
              {selection ? <>
                <div className="compare-product-top"><span aria-hidden="true">0{index + 1}</span><button type="button" onClick={() => removeComparedProduct(selection.id)} aria-label={t("compare.removeLabel", { name: product?.name ?? selection.name })}>{t("compare.remove")} ×</button></div>
                {product ? <>
                  <a href={productHref(product)} className="compare-product-image" tabIndex={-1} aria-hidden="true">{product.imageUrl ? <Image src={product.imageUrl} alt="" fill unoptimized sizes="(max-width: 600px) 44vw, 32vw" /> : <span>LCS</span>}</a>
                  <div className="compare-product-copy"><p>{product.brand ?? "LCS"}</p><h2><a href={productHref(product)}>{product.name}</a></h2></div>
                </> : <div className="compare-missing"><h2>{selection.name}</h2><p>{t("compare.unavailable")}</p></div>}
              </> : <a className="compare-add-slot" href="/shop"><span aria-hidden="true">+</span>{t("compare.chooseSecond")}</a>}
            </th>;
          })}
        </tr></thead>
        <tbody>
          <tr className="compare-price-row"><th scope="row" id="compare-price">{t("compare.price")}</th>{columns.map((product, index) => {
            const winner = product && verdict.kind === "winner" && verdict.winnerId === product.id;
            return <td headers={`compare-price compare-product-${index}`} className={winner ? "is-winner" : undefined} key={index}>
              {product?.priceCents != null ? <strong className="compare-price">{product.priceVaries ? t("compare.from", { price: money(product.priceCents, product.currency) }) : money(product.priceCents, product.currency)}</strong> : "—"}
              {winner && verdict.kind === "winner" ? <div className="compare-price-result"><span>✓ {t("compare.lowest")}</span><b>{t("compare.saving", { amount: money(verdict.savingCents, verdict.currency) })}</b></div> : null}
            </td>;
          })}</tr>
          {details.map((detail) => <tr key={detail.key}><th scope="row" id={`compare-${detail.key}`}>{detail.label}</th>{columns.map((product, index) => <td headers={`compare-${detail.key} compare-product-${index}`} key={index}>{product ? detail.value(product) || <span className="compare-muted">{t("compare.notSpecified")}</span> : "—"}</td>)}</tr>)}
          <tr className="compare-actions-row"><th scope="row"><span className="compare-announcement">{t("compare.view")}</span></th>{columns.map((product, index) => <td key={index}>{product ? <a href={productHref(product)} className="compare-primary" aria-label={`${t("compare.view")}: ${product.name}`}>{t("compare.view")} <span aria-hidden="true">↗</span></a> : null}</td>)}</tr>
        </tbody>
      </table>
      <p className="compare-price-note">{t("compare.priceNote")}</p>
      {items.length === 2 && verdict.kind === "unavailable" ? <p className="compare-price-note">{t("compare.noWinner")}</p> : null}
    </>}
  </section>;
}
