import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";

export const metadata: Metadata = {
  title: "Lusso Concept Store | Selezione privata",
  description: "Lusso Concept Store: ricerca, cura e assistenza diretta per una selezione privata.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div id="top" className="simple-home">
      <StoreHeader />

      <main>
        <section className="lusso-hero">
          <div className="lusso-hero-visual">
            <Image
              src="/images/lusso-concept-store-hero.png"
              alt="Interno di Lusso Concept Store con pareti in marmo chiaro, arredi neri e insegna luminosa"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 62vw"
            />
          </div>
          <div className="lusso-hero-copy">
            <p className="lusso-hero-index">Concept store · Italia</p>
            <div>
              <p className="simple-eyebrow">Selezione privata</p>
              <h1>Lusso,<br />con semplicità.</h1>
              <p>Ricerca, cura e assistenza diretta per un’esperienza personale, lontana dal rumore.</p>
              <div className="simple-actions">
                <Link className="simple-button simple-button-light" href="/contatti">Contattaci</Link>
                <Link className="lusso-text-link" href="#concept">Scopri il concept <span>↘</span></Link>
              </div>
            </div>
            <p className="lusso-hero-foot">Ricerca dedicata · Informazioni chiare · Assistenza diretta</p>
          </div>
        </section>

        <section className="simple-benefits" aria-label="Servizi del concept store">
          <p>Ricerca su richiesta</p>
          <p>Assistenza personale</p>
          <p>Informazioni verificate</p>
        </section>

        <section className="simple-note" id="concept">
          <p className="simple-eyebrow">Il nostro approccio</p>
          <h2>Un rapporto diretto, prima di tutto.</h2>
          <p>Ogni richiesta viene seguita personalmente. Per conoscere la selezione disponibile, ricevere informazioni o parlare con noi, scrivici attraverso la pagina contatti.</p>
          <div className="simple-actions">
            <Link className="simple-button" href="/contatti">Vai ai contatti</Link>
          </div>
        </section>

        <section className="simple-newsletter" id="private-list">
          <div>
            <p className="simple-eyebrow">Aggiornamenti</p>
            <h2>Novità, senza rumore.</h2>
          </div>
          <div>
            <p>Lascia la tua email per ricevere aggiornamenti dal concept store.</p>
            <NewsletterForm />
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
