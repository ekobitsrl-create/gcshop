"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/components/locale-provider";

export function StoreHeader() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const links = [
    { label: t("common.newIn"), href: "/shop" },
    { label: t("common.woman"), href: "/shop?categoria=donna" },
    { label: t("common.man"), href: "/shop?categoria=uomo" },
    { label: t("common.accessories"), href: "/shop?categoria=accessori" },
  ];
  const announcements = [t("header.freeShipping"), t("header.privateAccess")];

  useEffect(() => {
    void fetch("/api/cart", { cache: "no-store" })
      .then((response) => response.json())
      .then((cart) => setCartCount(cart.itemCount ?? 0))
      .catch(() => setCartCount(0));
  }, []);

  return (
    <>
      <div className="store-announcement" aria-label={t("header.announcements")}>
        <div className="announcement-track">
          {[false, true].map((duplicate) => (
            <div className="announcement-sequence" aria-hidden={duplicate || undefined} key={String(duplicate)}>
              {announcements.map((announcement) => (
                <span key={announcement}>{announcement}<b aria-hidden="true">✦</b></span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <header className="store-header">
        <button
          className={`store-menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <Link className="store-wordmark" href="/" aria-label="LCS, home">
          <strong>LCS</strong>
          <span>Selected edit</span>
        </Link>

        <nav className="store-nav" aria-label={t("header.primaryNav")}>
          {links.map((link) => (
            <Link href={link.href} key={link.label}>{link.label}</Link>
          ))}
          <Link href="/#manifesto">{t("common.theEdit")}</Link>
        </nav>

        <div className="store-actions">
          <LanguageSelector />
          <Link className="store-search-link" href="/shop">{t("common.search")}</Link>
          <Link className="store-bag" href="/checkout" aria-label={t("header.cartLabel", { count: cartCount })}>
            {t("common.cart")} <span>{String(cartCount).padStart(2, "0")}</span>
          </Link>
        </div>

        <nav className={`store-mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label={t("header.mobileMenu")}>
          <div className="mobile-nav-index">{t("common.menu")} / 01—05</div>
          {links.map((link, index) => (
            <Link href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{link.label}
            </Link>
          ))}
          <Link href="/#manifesto" onClick={() => setMenuOpen(false)}><span>05</span>{t("common.theEdit")}</Link>
          <LanguageSelector mobile />
          <div className="mobile-nav-footer">
            <Link href="/#private-list" onClick={() => setMenuOpen(false)}>{t("common.privateList")}</Link>
            <a href="tel:+393381346675">+39 338 134 6675</a>
          </div>
        </nav>
      </header>
    </>
  );
}
