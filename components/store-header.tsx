"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { catalogCategories } from "@/lib/catalog";

const links = [
  { label: "Tutti i prodotti", href: "/shop" },
  ...catalogCategories.map((category) => ({
    label: category.name,
    href: `/shop?categoria=${category.slug}`,
  })),
];

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    void fetch("/api/cart", { cache: "no-store" })
      .then((response) => response.json())
      .then((cart) => setCartCount(cart.itemCount ?? 0))
      .catch(() => setCartCount(0));
  }, []);

  return (
    <>
      <div className="store-announcement" aria-label="Comunicazioni del negozio">
        <span>Spedizione gratuita</span>
        <span>Pagamenti sicuri</span>
      </div>
      <header className="store-header">
        <button
          className={`store-menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <Link className="store-wordmark" href="/" aria-label="Lusso Concept Store, home">
          <strong>Lusso</strong>
          <span>Concept store</span>
        </Link>

        <nav className="store-nav" aria-label="Navigazione principale">
          {links.map((link) => <Link href={link.href} key={link.label}>{link.label}</Link>)}
        </nav>

        <div className="store-actions">
          <Link className="store-search-link" href="/shop">Cerca</Link>
          <Link className="store-bag" href="/checkout" aria-label={`Borsa, ${cartCount} articoli`}>
            Borsa <span>{cartCount}</span>
          </Link>
        </div>

        <nav className={`store-mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Menu mobile">
          {links.map((link) => (
            <Link href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
          <div className="mobile-nav-footer">
            <Link href="/informazioni-societarie" onClick={() => setMenuOpen(false)}>Contatti e assistenza</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
