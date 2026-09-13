"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useI18n } from "@/components/locale-provider";
import { LanguageSelector } from "@/components/language-selector";
import "@/app/checkout/checkout.css";

export function CheckoutIcon({ name }: { name: "lock" | "arrow" | "truck" | "check" | "bag" }) {
  const paths = {
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    truck: <><path d="M3 5h11v12H3zm11 5h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function CheckoutShell({ children, empty = false }: { children: ReactNode; empty?: boolean }) {
  const { t } = useI18n();
  return <div className="checkout-page">
    <header className="checkout-topbar">
      <Link className="checkout-wordmark" href="/" aria-label="LCS — Home">LCS<span>THE SELECTED EDIT</span></Link>
      <div className="checkout-topbar-right"><span className="checkout-secure"><CheckoutIcon name="lock" />{t("checkoutV2.secure")}</span><LanguageSelector /></div>
    </header>
    <main className="checkout-main">
      <nav className="checkout-progress" aria-label={t("checkoutV2.steps")}>
        <span><span className="step-complete"><CheckoutIcon name="check" /></span>{t("common.cart")}</span>
        <span className="step-connector" aria-hidden="true" />
        <span aria-current="step"><b>02</b>{t("checkoutV2.detailsStep")}</span>
        <span className="step-connector" aria-hidden="true" />
        <span className="step-next"><b>03</b>{t("checkoutV2.paymentStep")}</span>
      </nav>
      <div className="checkout-intro"><div><p className="checkout-eyebrow">THE FINAL EDIT</p><h1>{t(empty ? "checkout.empty" : "checkoutV2.title")}</h1><p>{t(empty ? "checkoutV2.emptyCopy" : "checkoutV2.subtitle")}</p></div>
        {!empty ? <Link className="checkout-back" href="/shop">{t("checkoutV2.backToShop")} <span aria-hidden="true">↗</span></Link> : null}
      </div>
      {children}
    </main>
    <footer className="checkout-footer"><span>© LCS</span><a href="mailto:info@ekobit.it">{t("checkoutV2.help")}</a><a href="/informazioni-societarie">{t("checkoutV2.company")}</a></footer>
  </div>;
}
