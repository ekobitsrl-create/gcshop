import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { WithdrawalForm } from "@/components/withdrawal-form";
import { getRequestLocale } from "@/lib/i18n-server";
import { returnsContent } from "@/lib/returns-content";
import "../commerce.css";

const sectionIds = ["spedizione", "recesso", "come-recedere", "restituzione", "cura", "rimborso", "eccezioni", "garanzia"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const content = returnsContent[locale];
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: "/spedizioni-e-resi" },
  };
}

export default async function ShippingAndReturnsPage() {
  const locale = await getRequestLocale();
  const content = returnsContent[locale];
  const emailSubject = encodeURIComponent(`${content.metaTitle} — LCS`);

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero returns-hero">
          <p className="commerce-kicker">{content.legalLabel}</p>
          <h1>{content.heroTitle}<br /><em>{content.heroEmphasis}</em></h1>
          <p className="commerce-hero-copy">{content.heroCopy}</p>
        </header>

        <section className="returns-summary" aria-labelledby="returns-summary-title">
          <div className="returns-summary-heading">
            <span>00</span>
            <h2 id="returns-summary-title">{content.summaryTitle}</h2>
          </div>
          <div className="returns-facts">
            {content.summary.map((item, index) => (
              <article key={item.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.value}</strong>
                <p>{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="returns-policy-layout">
          <aside className="returns-index" aria-label={content.navLabel}>
            <p>{content.navLabel}</p>
            <nav>
              {content.nav.map((item, index) => <a href={item.href} key={item.href}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>)}
            </nav>
          </aside>

          <article className="returns-policy">
            {content.sections.map((section, index) => (
              <section id={sectionIds[index]} key={section.number}>
                <span>{section.number}</span>
                <div>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
                  {index === 3 ? (
                    <address className="return-address">
                      <small>{content.addressLabel}</small>
                      {content.returnAddress}
                    </address>
                  ) : null}
                </div>
              </section>
            ))}
          </article>
        </div>

        <WithdrawalForm content={content.form} locale={locale} />

        <section className="withdrawal-model">
          <div>
            <p className="commerce-kicker">LCS / PDF</p>
            <h2>{content.modelTitle}</h2>
          </div>
          <div>
            <p>{content.modelCopy}</p>
            <div>
              <a href="/modulo-recesso" download>{content.downloadModel} <span>↓</span></a>
              <a href={`mailto:info@ekobit.it?subject=${emailSubject}`}>{content.emailAlternative} <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="returns-legal-note">
          <div><p>{content.sourcesTitle}</p><span>{content.updated}</span></div>
          <div>
            <p>{content.sourcesCopy}</p>
            <div>
              <a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2005-09-06;206" target="_blank" rel="noreferrer">Normattiva ↗</a>
              <a href="https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_it.htm" target="_blank" rel="noreferrer">Your Europe ↗</a>
            </div>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
