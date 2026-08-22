import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Informazioni societarie",
  description: "Dati societari e contatti dell'operatore di Lusso Concept Store.",
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
          <p className="commerce-hero-copy">Dati dell&apos;operatore economico, contatti e riferimenti della società che gestisce il negozio.</p>
        </header>
        <section className="commerce-main company-information" aria-label="Dati societari">
          <div>
            <p className="commerce-kicker">Operatore</p>
            <h2>Ekobit SRL</h2>
          </div>
          <dl>
            <div><dt>Partita IVA</dt><dd>02424510796</dd></div>
            <div><dt>Sede</dt><dd>Via Firenze 185<br />88900 Crotone (KR), Italia</dd></div>
            <div><dt>Telefono</dt><dd><a href="tel:+393381346675">+39 338 134 6675</a></dd></div>
            <div><dt>Email</dt><dd><a href="mailto:info@ekobit.it">info@ekobit.it</a></dd></div>
          </dl>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
