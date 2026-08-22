import type { Metadata } from "next";
import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Informazioni societarie",
  description: "Informazioni societarie di Lusso Concept Store in aggiornamento.",
  alternates: { canonical: "/informazioni-societarie" },
};

export default function CompanyInformationPage() {
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero company-hero">
          <p className="commerce-kicker">Lusso Concept Store / Legal</p>
          <h1>Informazioni<br /><em>societarie.</em></h1>
          <p className="commerce-hero-copy">I riferimenti del nuovo operatore saranno pubblicati prima dell&apos;apertura del negozio.</p>
        </header>
        <section className="commerce-main company-information" aria-label="Dati societari">
          <div>
            <p className="commerce-kicker">Nuovo operatore</p>
            <h2>Dati in aggiornamento.</h2>
          </div>
          <div className="company-pending-copy">
            <p>Ragione sociale, partita IVA, sede e contatti verranno inseriti non appena saranno definiti.</p>
            <Link href="/contatti">Vai ai contatti <span>→</span></Link>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
