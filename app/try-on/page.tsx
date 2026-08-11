import type { Metadata } from "next";
import Image from "next/image";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import "./try-on.css";

export const metadata: Metadata = {
  title: "Virtual Try-On AR",
  description: "Non immaginarlo. Indossalo. Scopri il futuro camerino AR di Luxury Concept Store.",
};

const previewLooks = [
  { index: "01", name: "Sculpted", category: "Donna", image: "/images/product-2.jpg", slug: "abito-sculpted-bordeaux" },
  { index: "02", name: "Graphite", category: "Uomo", image: "/images/category-man.jpg", slug: "overshirt-lana-grafite" },
  { index: "03", name: "Atelier", category: "Accessori", image: "/images/category-accessories.jpg", slug: "borsa-atelier-01" },
];

export default function TryOnPage() {
  return (
    <div className="commerce-shell tryon-page">
      <CommerceHeader />
      <main>
        <header className="tryon-heading">
          <p>Luxury Concept Store / Vision 01</p>
          <div className="tryon-heading-status"><i />AR experience / In sviluppo</div>
          <h1>Non immaginarlo.<br /><em>Indossalo.</em></h1>
          <div className="tryon-heading-copy">
            <span>Scan. Step in. Move.</span>
            <p>Inquadra il QR, entra nello specchio digitale e guarda il look reagire a ogni movimento.</p>
          </div>
          <div className="tryon-scroll-cue" aria-hidden="true"><span>Discover</span><i /></div>
        </header>

        <section className="tryon-experience" aria-labelledby="tryon-experience-title">
          <div className="tryon-campaign">
            <Image src="/images/try-on-campaign.png" alt="Campagna Virtual Try-On di Luxury Concept Store" fill priority sizes="100vw" />
            <div className="tryon-campaign-shade" />
            <div className="tryon-orbit" aria-hidden="true"><i /><span>LCS</span></div>
            <div className="tryon-campaign-status"><span>AR / DROP 01</span><strong>REAL-TIME FITTING EXPERIENCE</strong></div>
            <div className="tryon-campaign-pulse"><i />Body tracking signal</div>
          </div>

          <div className="tryon-look-rail" aria-label="Look che supporteranno il Try-On AR">
            {previewLooks.map((look) => (
              <a href={`/prodotto/${look.slug}`} key={look.index}>
                <div><Image src={look.image} alt="" fill sizes="120px" /></div>
                <span>{look.index}</span>
                <p><small>{look.category}</small><strong>{look.name}</strong></p>
                <b>Shop</b>
              </a>
            ))}
          </div>

          <div className="tryon-experience-copy">
            <div>
              <p className="commerce-kicker">The mirror is changing</p>
              <h2 id="tryon-experience-title">Tu ti muovi.<br /><em>Il look ti segue.</em></h2>
            </div>
            <div>
              <p>Niente foto da caricare, niente avatar immobile. Il progetto unirà accesso immediato via QR, tracking del corpo e capi digitalizzati in uno specchio AR fluido e personale.</p>
              <ul>
                <li><span>01</span>Accesso istantaneo</li>
                <li><span>02</span>Movimento reale</li>
                <li><span>03</span>Cambio look live</li>
              </ul>
              <a href="/shop">Esplora i look <span>↗</span></a>
            </div>
          </div>
        </section>

        <div className="tryon-rhythm" aria-hidden="true">
          <div>Scan <span>✦</span> Step in <span>✦</span> Move <span>✦</span> Switch <span>✦</span> Own it <span>✦</span> Scan <span>✦</span></div>
        </div>

        <section className="tryon-how">
          <p>One gesture away / 01—03</p>
          <h2>Dal prodotto.<br /><em>Dentro il look.</em></h2>
          <div>
            <article><span>01</span><h3>Scan</h3><p>Il QR del prodotto apre immediatamente il suo look digitale.</p></article>
            <article><span>02</span><h3>Step in</h3><p>Entri nell'inquadratura: nessuna app, nessuna foto da caricare.</p></article>
            <article><span>03</span><h3>Own it</h3><p>Ti muovi, cambi variante e decidi con il look già davanti agli occhi.</p></article>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
