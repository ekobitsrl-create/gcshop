"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Il concept", href: "/#concept" },
  { label: "Contatti", href: "/contatti" },
  { label: "Informazioni", href: "/informazioni-societarie" },
];

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="store-announcement" role="region" aria-label="Comunicazioni del concept store">
        <span>Selezione privata</span>
        <span>Assistenza diretta</span>
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
          <Image className="store-logo-mark" src="/lusso-logo-mark.png" alt="" width={512} height={512} priority />
          <span className="store-logo-copy">
            <strong>Lusso</strong>
            <span>Concept store</span>
          </span>
        </Link>

        <nav className="store-nav" aria-label="Navigazione principale">
          {links.map((link) => <Link href={link.href} key={link.label}>{link.label}</Link>)}
        </nav>

        <div className="store-actions">
          <Link className="store-search-link" href="/contatti">Contattaci</Link>
        </div>

        <nav className={`store-mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Menu mobile">
          {links.map((link) => (
            <Link href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
        </nav>
      </header>
    </>
  );
}
