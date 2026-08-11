import Image from "next/image";
import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter-form";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";

export const metadata: Metadata = {
  title: "LCS | The Selected Edit",
  description: "Moda contemporanea e accessori selezionati per materia, proporzione e carattere. Scopri il nuovo edit LCS.",
  alternates: { canonical: "/" },
};

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
          <p className="micro-label">LCS / Edit 01</p>
          <h1>Scelto.<br /><em>Non esibito.</em></h1>
          <div className="hero-copy-bottom">
            <p>Moda e oggetti scelti per materia, proporzione e carattere. Il resto può rimanere fuori.</p>
            <div className="hero-commerce-actions">
              <a className="hero-shop-link" href="/shop?categoria=donna">Shop donna <span>↗</span></a>
              <a className="hero-shop-link" href="/shop?categoria=uomo">Shop uomo <span>↗</span></a>
              <a className="hero-text-link" href="/shop">Esplora tutto l'edit <span>→</span></a>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <Image src="/images/editorial.jpg" alt="Editoriale moda della selezione LCS" fill priority sizes="(max-width: 820px) 100vw, 58vw" />
          <div className="hero-visual-tag"><span>The edit</span><strong>01</strong></div>
          <p>Form / Matter / Character</p>
        </div>

        <div className="hero-side-note" aria-hidden="true">LCS · Selected fashion and objects · Edit 01</div>
      </section>

      <section className="ticker" aria-label="Valori del negozio">
        <div>New in <span>✦</span> Donna <span>✦</span> Uomo <span>✦</span> Accessori <span>✦</span> Private list <span>✦</span></div>
      </section>

      <section className="manifesto" id="manifesto">
        <div className="manifesto-label"><span>01</span><p>Manifesto</p></div>
        <div className="manifesto-copy">
          <p className="micro-label">The art of selection.</p>
          <h2>Non tutto merita<br />di entrare.</h2>
          <p className="manifesto-lead">Scegliere è togliere.</p>
          <div className="manifesto-detail">
            <p>Ogni edit nasce da una sottrazione. Meno rumore, meno compromessi, più attenzione a forma, materia e presenza.</p>
            <span>LCS / EDIT 01</span>
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
          <Image src="/images/product-2.jpg" alt="Look grafici della selezione LCS" fill sizes="(max-width: 800px) 100vw, 50vw" />
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

      <section className="trust-story" id="provenienza" aria-labelledby="trust-title">
        <div className="trust-index"><span>04</span><p>Provenienza e autenticità</p></div>
        <div className="trust-content">
          <p className="micro-label">Trust is a method.</p>
          <h2 id="trust-title">Prima il controllo.<br /><em>Poi la scelta.</em></h2>
          <p className="trust-lead">Non promettiamo ciò che non possiamo documentare.</p>
          <div className="trust-principles">
            <article>
              <span>01</span>
              <h3>Informazioni verificabili</h3>
              <p>Con il catalogo definitivo, ogni articolo sarà accompagnato dalle informazioni disponibili su provenienza commerciale, condizioni e composizione.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Controllo prima della pubblicazione</h3>
              <p>Descrizioni, immagini, varianti e disponibilità saranno controllate prima di entrare nella selezione online.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Un referente reale</h3>
              <p>Ogni dubbio può essere chiarito prima dell'acquisto: condizioni, composizione e disponibilità devono essere comprensibili.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="newsletter-section" id="private-list">
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
