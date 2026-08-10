import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { TryOnStudio } from "@/components/try-on-studio";
import { placeholderProducts } from "@/lib/placeholder-products";
import "./try-on.css";

export const metadata: Metadata = {
  title: "Virtual Try-On",
  description: "Prova virtualmente la selezione Luxury Concept Store sulla tua foto, direttamente nel browser.",
};

export default async function TryOnPage({ searchParams }: { searchParams: Promise<{ prodotto?: string }> }) {
  const { prodotto } = await searchParams;
  const products = placeholderProducts.map(({ name, slug, imageUrl, categoryName }) => ({ name, slug, imageUrl, categoryName }));

  return (
    <div className="commerce-shell tryon-page">
      <CommerceHeader />
      <main>
        <header className="tryon-heading">
          <div className="tryon-heading-index"><span>01</span><i /></div>
          <p>Luxury Concept Store / Vision system</p>
          <h1>Il tuo corpo.<br />Il nostro edit.<br /><em>Una nuova decisione.</em></h1>
          <div className="tryon-heading-copy">
            <span>Virtual Try-On / Beta</span>
            <p>Visualizza, regola, confronta. La nuova prova digitale vive nel tuo browser e mette la tua immagine al centro.</p>
          </div>
        </header>

        <section className="tryon-studio-section" aria-label="Studio Virtual Try-On">
          <TryOnStudio products={products} initialProduct={prodotto} />
        </section>

        <section className="tryon-how">
          <p>How it works / 01—03</p>
          <h2>Più personale.<br /><em>Meno esitazioni.</em></h2>
          <div>
            <article><span>01</span><h3>Carica</h3><p>Usa una foto luminosa e frontale. Rimane esclusivamente nel tuo browser.</p></article>
            <article><span>02</span><h3>Componi</h3><p>Scegli un pezzo e regola scala, posizione e intensità dell'anteprima.</p></article>
            <article><span>03</span><h3>Decidi</h3><p>Confronta il risultato e torna al prodotto con un'idea più chiara del look.</p></article>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
