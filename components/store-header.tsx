"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { label: "New in", href: "/shop" },
  { label: "Donna", href: "/shop?categoria=donna" },
  { label: "Uomo", href: "/shop?categoria=uomo" },
  { label: "Accessori", href: "/shop?categoria=accessori" },
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
      <div className="store-announcement">
        <span>Spedizione gratuita</span>
        <span className="announcement-center">Crotone · Italia</span>
        <a href="mailto:info@ekobit.it">Client service</a>
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

        <Link className="store-wordmark" href="/" aria-label="Luxury Concept Store, home">
          <strong>Luxury</strong>
          <span>Concept Store</span>
        </Link>

        <nav className="store-nav" aria-label="Navigazione principale">
          {links.map((link) => (
            <Link href={link.href} key={link.label}>{link.label}</Link>
          ))}
          <Link href="/#manifesto">The edit</Link>
        </nav>

        <div className="store-actions">
          <Link className="store-search-link" href="/shop">Cerca</Link>
          <Link className="store-bag" href="/checkout" aria-label={`Borsa, ${cartCount} articoli`}>
            Borsa <span>{String(cartCount).padStart(2, "0")}</span>
          </Link>
        </div>

        <nav className={`store-mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Menu mobile">
          <div className="mobile-nav-index">Menu / 01—05</div>
          {links.map((link, index) => (
            <Link href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{link.label}
            </Link>
          ))}
          <Link href="/#manifesto" onClick={() => setMenuOpen(false)}><span>05</span>The edit</Link>
          <div className="mobile-nav-footer">
            <a href="mailto:info@ekobit.it">info@ekobit.it</a>
            <a href="tel:+393381346675">+39 338 134 6675</a>
          </div>
        </nav>
      </header>
    </>
  );
}
