import Image from "next/image";
import { NewsletterForm } from "@/components/newsletter-form";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";

const categories = [
  { index: "01", title: "Donna", note: "Forme decise, libertà assoluta", image: "/images/category-woman.jpg", position: "center" },
  { index: "02", title: "Uomo", note: "Sartoriale, senza formalità", image: "/images/category-man.jpg", position: "center" },
  { index: "03", title: "Accessori", note: "L'oggetto che cambia tutto", image: "/images/category-accessories.jpg", position: "center" },
];

export default function Home() {
  return (
    <main id="top" className="home-page">
      <StoreHeader />

      <section className="new-hero">
        <div className="hero-copy-panel">
          <p className="micro-label">Luxury Concept Store / Est. 2026</p>
          <h1>Il lusso<br />è un <em>punto<br />di vista.</em></h1>
          <div className="hero-copy-bottom">
            <p>Una selezione indipendente di moda e accessori, curata in Italia per chi sceglie prima di seguire.</p>
            <a className="circle-link" href="/shop" aria-label="Scopri la selezione"><span>Scopri</span><b>↗</b></a>
          </div>
        </div>

        <div className="hero-visual">
          <Image src="/images/editorial.jpg" alt="Editoriale Luxury Concept Store a Milano" fill priority sizes="(max-width: 820px) 100vw, 58vw" />
          <div className="hero-visual-tag"><span>Issue</span><strong>01</strong></div>
          <p>Milano / Collezione 2026</p>
        </div>

        <div className="hero-side-note" aria-hidden="true">Independent fashion selection · Crotone, Italy</div>
      </section>

      <section className="ticker" aria-label="Valori del negozio">
        <div>Nuovi codici <span>✦</span> Selezione indipendente <span>✦</span> Dettagli che restano <span>✦</span> Nuovi codici <span>✦</span></div>
      </section>

      <section className="manifesto" id="manifesto">
        <div className="manifesto-label"><span>01</span><p>Manifesto</p></div>
        <div className="manifesto-copy">
          <p className="micro-label">No trends. Just instinct.</p>
          <h2>Non cerchiamo<br />quello che piace a tutti.</h2>
          <p className="manifesto-lead">Cerchiamo quello che lascia il segno.</p>
          <div className="manifesto-detail">
            <p>Il nostro lusso non è distanza, è precisione. È materia, carattere, proporzione. Una selezione costruita pezzo dopo pezzo, senza rumore.</p>
            <span>LCS / 2026</span>
          </div>
        </div>
      </section>

      <section className="category-story" aria-labelledby="category-title">
        <div className="category-heading">
          <div><span>02</span><p>Shop by attitude</p></div>
          <h2 id="category-title">Tre prospettive.<br /><em>Un solo istinto.</em></h2>
        </div>
        <div className="category-mosaic">
          {categories.map((category) => (
            <a href={`/shop?categoria=${category.title.toLowerCase()}`} className="category-tile" key={category.title}>
              <Image src={category.image} alt={category.note} fill sizes="(max-width: 760px) 100vw, 34vw" style={{ objectPosition: category.position }} />
              <span className="category-index">{category.index}</span>
              <div className="category-tile-copy">
                <p>{category.note}</p>
                <h3>{category.title}</h3>
                <span>Entra ↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="feature-story">
        <div className="feature-image">
          <Image src="/images/product-2.jpg" alt="Look grafici della selezione Luxury Concept Store" fill sizes="(max-width: 800px) 100vw, 50vw" />
          <span>New forms / 01</span>
        </div>
        <div className="feature-copy">
          <p className="micro-label">The edit / Vol. 01</p>
          <h2>Colore.<br />Contrasto.<br /><em>Carattere.</em></h2>
          <p>La nuova eleganza non chiede permesso. Abbina linee nette, dettagli inattesi e una sicurezza che viene da dentro.</p>
          <a className="text-link" href="/shop">Scopri l’edit <span>↗</span></a>
          <div className="feature-signature">LCS</div>
        </div>
      </section>

      <section className="objects-section">
        <div className="objects-intro">
          <span>03</span>
          <div><p className="micro-label">Objects of desire</p><h2>Il dettaglio<br />fa il look.</h2></div>
          <p>Oggetti scelti per diventare firma, non complemento.</p>
        </div>
        <div className="objects-grid">
          <a href="/shop?categoria=accessori" className="object-card object-card-large">
            <Image src="/images/product-3.jpg" alt="Borsa con stampa floreale" fill sizes="(max-width: 760px) 100vw, 54vw" />
            <span>01 / Borse</span>
          </a>
          <a href="/shop?categoria=accessori" className="object-card">
            <Image src="/images/category-accessories.jpg" alt="Borsa rossa strutturata" fill sizes="(max-width: 760px) 100vw, 35vw" />
            <span>02 / Icons</span>
          </a>
        </div>
      </section>

      <section className="newsletter-section">
        <div>
          <p className="micro-label">Private list</p>
          <h2>Prima degli altri.<br /><em>Solo quando conta.</em></h2>
        </div>
        <div className="newsletter-copy">
          <p>Nuovi arrivi, storie e selezioni private. Niente rumore, solo cose scelte bene.</p>
          <NewsletterForm />
        </div>
      </section>

      <StoreFooter />
    </main>
  );
}
