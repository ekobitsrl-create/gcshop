"use client";

import { FormEvent, useState } from "react";

const collections = [
  {
    title: "Donna",
    eyebrow: "Nuova eleganza",
    image: "/images/category-woman.jpg",
    alt: "Look donna contemporaneo in una tonalità solare",
  },
  {
    title: "Uomo",
    eyebrow: "Sartoriale quotidiano",
    image: "/images/category-man.jpg",
    alt: "Completo uomo sartoriale blu",
  },
  {
    title: "Accessori",
    eyebrow: "Dettagli iconici",
    image: "/images/category-accessories.jpg",
    alt: "Borsa strutturata color corallo",
  },
];

const products = [
  {
    name: "Abito Grafico Milano",
    category: "Donna · New in",
    price: "149,00 €",
    image: "/images/product-2.jpg",
    alt: "Due look donna dal taglio grafico",
    badge: "Nuovo",
  },
  {
    name: "Borsa Atelier Bloom",
    category: "Accessori · Borse",
    price: "189,00 €",
    image: "/images/product-3.jpg",
    alt: "Borsa strutturata con motivo floreale",
    badge: "Esclusiva",
  },
  {
    name: "Giacca Denim Nuvola",
    category: "Unisex · Outerwear",
    price: "119,00 €",
    image: "/images/product-4.jpg",
    alt: "Giacca in denim chiaro con collo morbido",
    badge: "Essenziale",
  },
  {
    name: "Completo Sartoriale Navy",
    category: "Uomo · Tailoring",
    price: "229,00 €",
    image: "/images/category-man.jpg",
    alt: "Completo uomo blu dal taglio contemporaneo",
    badge: "Selezione",
  },
];

const navItems = ["New in", "Donna", "Uomo", "Accessori", "The edit"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  const addToCart = (productName: string) => {
    setCartCount((count) => count + 1);
    setNotice(`${productName} è nel tuo carrello.`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterSent(true);
  };

  return (
    <main>
      <div className="announcement">
        <p>Spedizione gratuita su tutti gli ordini</p>
        <span aria-hidden="true">•</span>
        <p>Reso facile entro 14 giorni</p>
      </div>

      <header className="site-header">
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <a className="brand" href="#top" aria-label="Luxury Concept Store, home">
          <span className="brand-monogram" aria-hidden="true">
            <span>L</span>
            <span>C</span>
          </span>
          <span className="brand-name">
            <strong>Luxury</strong>
            <em>Concept Store</em>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navigazione principale">
          {navItems.map((item) => (
            <a href="#shop" key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="text-action"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            Cerca
          </button>
          <button type="button" className="bag-action" aria-label={`Carrello, ${cartCount} articoli`}>
            Bag <span>{cartCount}</span>
          </button>
        </div>

        <nav className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Menu mobile">
          {navItems.map((item, index) => (
            <a href="#shop" key={item} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>
              {item}
            </a>
          ))}
          <div className="mobile-contact">
            <a href="tel:+393381346675">+39 338 134 6675</a>
            <a href="mailto:info@ekobit.it">info@ekobit.it</a>
          </div>
        </nav>
      </header>

      <div className={`search-panel ${searchOpen ? "is-open" : ""}`}>
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="site-search">Cosa stai cercando?</label>
          <div>
            <input id="site-search" name="q" type="search" placeholder="Abiti, borse, nuovi arrivi…" />
            <button type="submit">Cerca</button>
          </div>
        </form>
      </div>

      <section className="hero" id="top">
        <img
          className="hero-image"
          src="/images/editorial.jpg"
          alt="Editoriale moda davanti al Duomo di Milano"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="kicker light">Curated in Italy · Collezione 2026</p>
          <h1>
            Il lusso,
            <em>nel tuo stile.</em>
          </h1>
          <p className="hero-copy">
            Una selezione indipendente di moda e accessori per chi sceglie qualità,
            carattere e bellezza senza tempo.
          </p>
          <a className="button button-light" href="#shop">
            Scopri la collezione <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-index" aria-hidden="true">
          <span>01</span>
          <div />
          <span>04</span>
        </div>
        <p className="hero-caption">Milano — Una nuova idea di stile</p>
      </section>

      <section className="service-strip" aria-label="Servizi">
        <div>
          <span>01</span>
          <p><strong>Spedizione gratuita</strong> su tutti gli ordini</p>
        </div>
        <div>
          <span>02</span>
          <p><strong>Reso semplice</strong> entro 14 giorni</p>
        </div>
        <div>
          <span>03</span>
          <p><strong>Pagamenti sicuri</strong> e protetti</p>
        </div>
      </section>

      <section className="collections section-shell" aria-labelledby="collections-title">
        <div className="section-intro">
          <div>
            <p className="kicker">La nostra selezione</p>
            <h2 id="collections-title">Vestire è raccontarsi.</h2>
          </div>
          <p>
            Collezioni curate per accompagnare ogni momento con autenticità.
            Pezzi contemporanei, dettagli ricercati, una sola regola: sentirsi sé stessi.
          </p>
        </div>

        <div className="collection-grid">
          {collections.map((collection, index) => (
            <a className="collection-card" href="#shop" key={collection.title}>
              <img src={collection.image} alt={collection.alt} loading="lazy" />
              <div className="collection-overlay" />
              <span className="collection-number">0{index + 1}</span>
              <div className="collection-copy">
                <p>{collection.eyebrow}</p>
                <h3>{collection.title}</h3>
                <span>Esplora <b aria-hidden="true">↗</b></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="products section-shell" id="shop" aria-labelledby="products-title">
        <div className="products-heading">
          <div>
            <p className="kicker">Appena arrivati</p>
            <h2 id="products-title">The new edit</h2>
          </div>
          <a href="#shop">Vedi tutto <span aria-hidden="true">→</span></a>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-visual">
                <img src={product.image} alt={product.alt} loading="lazy" />
                <span className="product-badge">{product.badge}</span>
                <button type="button" onClick={() => addToCart(product.name)}>
                  Aggiungi al carrello
                </button>
              </div>
              <div className="product-info">
                <p>{product.category}</p>
                <div>
                  <h3>{product.name}</h3>
                  <strong>{product.price}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial">
        <div className="editorial-image">
          <img src="/images/hero.jpg" alt="Selezione di capi dai toni naturali" loading="lazy" />
          <span>Luxury Concept Store · The Journal</span>
        </div>
        <div className="editorial-copy">
          <p className="kicker light">La nostra filosofia</p>
          <h2>Curato con intenzione.<br /><em>Scelto per durare.</em></h2>
          <p>
            Luxury Concept Store nasce dall’idea che il vero lusso sia personale:
            meno rumore, più qualità. Selezioniamo forme, materiali e dettagli capaci
            di attraversare le stagioni e diventare parte della tua storia.
          </p>
          <a className="button button-outline-light" href="#contact">
            Conosci la boutique <span aria-hidden="true">↗</span>
          </a>
          <div className="editorial-mark" aria-hidden="true">LCS</div>
        </div>
      </section>

      <section className="newsletter section-shell" aria-labelledby="newsletter-title">
        <div>
          <p className="kicker">Private list</p>
          <h2 id="newsletter-title">Entra nel nostro mondo.</h2>
        </div>
        {newsletterSent ? (
          <p className="newsletter-success" role="status">
            Grazie. Ora fai parte della private list di Luxury Concept Store.
          </p>
        ) : (
          <form onSubmit={submitNewsletter}>
            <label htmlFor="newsletter-email">Ricevi nuovi arrivi, storie e selezioni private.</label>
            <div>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="La tua email"
                required
              />
              <button type="submit" aria-label="Iscriviti alla newsletter">→</button>
            </div>
            <small>Iscrivendoti accetti la nostra informativa privacy.</small>
          </form>
        )}
      </section>

      <footer id="contact">
        <div className="footer-top section-shell">
          <div className="footer-brand">
            <a className="brand brand-light" href="#top" aria-label="Luxury Concept Store, torna in alto">
              <span className="brand-monogram" aria-hidden="true">
                <span>L</span>
                <span>C</span>
              </span>
              <span className="brand-name">
                <strong>Luxury</strong>
                <em>Concept Store</em>
              </span>
            </a>
            <p>Moda contemporanea, curata in Italia.</p>
          </div>

          <div className="footer-column">
            <h3>Shop</h3>
            <a href="#shop">New in</a>
            <a href="#shop">Donna</a>
            <a href="#shop">Uomo</a>
            <a href="#shop">Accessori</a>
          </div>

          <div className="footer-column">
            <h3>Assistenza</h3>
            <a href="mailto:info@ekobit.it">Contattaci</a>
            <a href="#top">Spedizioni</a>
            <a href="#top">Resi e rimborsi</a>
            <a href="#top">Guida alle taglie</a>
          </div>

          <address className="footer-column company-data">
            <h3>Luxury Concept Store</h3>
            <p>Ekobit SRL</p>
            <p>P. IVA 02424510796</p>
            <p>Via Firenze 185</p>
            <p>88900 Crotone (KR)</p>
            <a href="tel:+393381346675">+39 338 134 6675</a>
            <a href="mailto:info@ekobit.it">info@ekobit.it</a>
          </address>
        </div>

        <div className="footer-bottom section-shell">
          <p>© 2026 Ekobit SRL. Tutti i diritti riservati.</p>
          <div>
            <a href="#top">Privacy</a>
            <a href="#top">Cookie</a>
            <a href="#top">Termini e condizioni</a>
          </div>
          <a href="#top">Torna su ↑</a>
        </div>
      </footer>

      <div className={`toast ${notice ? "is-visible" : ""}`} role="status" aria-live="polite">
        {notice}
      </div>
    </main>
  );
}
