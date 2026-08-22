import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Contatti e assistenza",
  description: "Recapiti e informazioni di assistenza di Lusso Concept Store.",
  alternates: { canonical: "/contatti" },
};

export default function ContactsPage() {
  return (
    <LegalPage
      kicker="Assistenza"
      title="Contatti"
      intro="I canali per ordini, resi, garanzia e richieste privacy saranno pubblicati prima dell’apertura."
    >
      <section>
        <h2>Recapiti in aggiornamento</h2>
        <div className="legal-table" role="table" aria-label="Recapiti in aggiornamento">
          <div role="row"><strong role="cell">Assistenza ordini</strong><span role="cell">Email e telefono da definire</span></div>
          <div role="row"><strong role="cell">Resi</strong><span role="cell">Email e indirizzo di restituzione da definire</span></div>
          <div role="row"><strong role="cell">Privacy</strong><span role="cell">Recapito per l&apos;esercizio dei diritti da definire</span></div>
          <div role="row"><strong role="cell">Sede del venditore</strong><span role="cell">Da definire</span></div>
        </div>
        <p>
          Per evitare riferimenti errati, nessun recapito della precedente società è stato mantenuto. Consulta anche
          le <Link href="/informazioni-societarie">informazioni societarie</Link> e la pagina
          <Link href="/spedizioni-e-resi"> Spedizioni e resi</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
