import type { ReactNode } from "react";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";

type LegalPageProps = {
  kicker: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function LegalPage({ kicker, title, intro, children }: LegalPageProps) {
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero legal-hero">
          <p className="commerce-kicker">Lusso Concept Store / {kicker}</p>
          <h1>{title}</h1>
          <p className="commerce-hero-copy">{intro}</p>
        </header>
        <article className="commerce-main legal-content">
          <aside className="legal-launch-notice" aria-label="Avviso pre-lancio">
            <strong>Documento pre-lancio</strong>
            <p>
              L&apos;identità e i recapiti del nuovo titolare e venditore sono ancora in definizione.
              Questi dati dovranno essere completati prima di accettare ordini.
            </p>
          </aside>
          {children}
          <p className="legal-updated">Ultimo aggiornamento: 22 agosto 2026.</p>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
