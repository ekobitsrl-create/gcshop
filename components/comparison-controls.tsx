"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/locale-provider";
import { clearComparison, removeComparedProduct, toggleComparedProduct, useComparison } from "@/components/comparison-store";
import { isComparisonId, type ComparisonSelection } from "@/lib/product-comparison";

export function ComparisonIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="7" height="14" rx="1" /><rect x="14" y="5" width="7" height="14" rx="1" /></svg>;
}

export function CompareButton({ product }: { product: ComparisonSelection }) {
  const { items, ready } = useComparison();
  const { t } = useI18n();
  if (!isComparisonId(product.id)) return null;
  const selected = items.some((item) => item.id === product.id);
  return <button type="button" className="compare-button" aria-pressed={selected} disabled={!ready} onClick={() => toggleComparedProduct(product)} aria-label={t(selected ? "compare.removeLabel" : "compare.addLabel", { name: product.name })}>
    <ComparisonIcon /><span>{t(selected ? "compare.selected" : "compare.add")}</span>{selected ? <span aria-hidden="true">✓</span> : null}
  </button>;
}

export function ComparisonNav() {
  const { items } = useComparison();
  const { t } = useI18n();
  return <a href="/confronta" className="store-compare" aria-label={t("compare.countLabel", { count: items.length })} title={t("compare.label")}>
    <ComparisonIcon /><span>{items.length}</span>
  </a>;
}

export function ComparisonTray() {
  const { items, notice } = useComparison();
  const { t } = useI18n();
  const pathname = usePathname();
  if (pathname === "/confronta" || /^\/(checkout|admin|account)(\/|$)/.test(pathname)) return null;
  return <>
    <div className="compare-announcement" role="status" aria-atomic="true">{notice ? t(notice) : ""}</div>
    {items.length > 0 ? <>
      <div className="compare-tray-spacer" />
      <aside className="compare-tray" aria-label={t("compare.label")}>
        <div className="compare-tray-heading"><ComparisonIcon /><strong>{t("compare.label")}</strong><span>{items.length} / 2</span></div>
        <div className="compare-tray-items">
          {items.map((item, index) => <div className="compare-tray-item" key={item.id}><small>0{index + 1}</small><span title={item.name}>{item.name}</span><button type="button" onClick={() => removeComparedProduct(item.id)} aria-label={t("compare.removeLabel", { name: item.name })}>×</button></div>)}
          {items.length === 1 ? <a className="compare-tray-placeholder" href="/shop">+ {t("compare.chooseSecond")}</a> : null}
        </div>
        <div className="compare-tray-actions"><a className="compare-primary" href="/confronta">{t("compare.open")} <span aria-hidden="true">↗</span></a><button type="button" onClick={clearComparison}>{t("compare.clear")}</button></div>
        {notice === "compare.limit" ? <p className="compare-limit">{t(notice)}</p> : null}
      </aside>
    </> : null}
  </>;
}
