import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import "./try-on.css";

export const metadata: Metadata = {
  title: "Virtual Try-On AR",
  description: "Il futuro camerino AR di Luxury Concept Store: QR sul prodotto e prova live tramite webcam, senza caricare foto.",
};

export default function TryOnPage() {
  return (
    <div className="commerce-shell tryon-page">
      <CommerceHeader />
      <main>
        <header className="tryon-heading">
          <div className="tryon-heading-index"><span>01</span><i /></div>
          <p>Luxury Concept Store / AR fitting project</p>
          <h1>Camera live.<br />Zero upload.<br /><em>Il look, in movimento.</em></h1>
          <div className="tryon-heading-copy">
            <span>Virtual Try-On / In sviluppo</span>
            <p>Stiamo collegando un motore AR professionale: il capo verrà applicato al corpo in tempo reale, senza chiederti di caricare immagini.</p>
          </div>
        </header>

        <section className="tryon-live-section" aria-labelledby="tryon-live-title">
          <div className="tryon-live-frame" aria-hidden="true">
            <div className="tryon-live-grid" />
            <div className="tryon-live-body"><i /><i /><i /></div>
            <div className="tryon-live-status"><span>LCS / AR CAMERA</span><strong>PROVIDER LINK PENDING</strong></div>
            <div className="tryon-live-message"><span>●</span><p>Webcam live<br /><small>Disponibile dopo l'attivazione del partner AR</small></p></div>
          </div>
          <div className="tryon-live-copy">
            <p className="commerce-kicker">No photo upload</p>
            <h2 id="tryon-live-title">Quello giusto.<br /><em>Non una simulazione.</em></h2>
            <p>La versione precedente è stata rimossa. Il nuovo flusso partirà dal QR presente sulla scheda prodotto e aprirà direttamente una sessione webcam con tracking del corpo.</p>
            <a href="/shop">Torna alla selezione <span>↗</span></a>
          </div>
        </section>

        <section className="tryon-how">
          <p>Planned flow / 01—03</p>
          <h2>Dal prodotto.<br /><em>Direttamente su di te.</em></h2>
          <div>
            <article><span>01</span><h3>Inquadra</h3><p>Ogni capo compatibile avrà un QR personale nella pagina prodotto.</p></article>
            <article><span>02</span><h3>Attiva</h3><p>Il browser chiederà esclusivamente il permesso per usare la webcam live.</p></article>
            <article><span>03</span><h3>Indossa</h3><p>Il motore AR seguirà corpo, prospettiva e movimento in tempo reale.</p></article>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
