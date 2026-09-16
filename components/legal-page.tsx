import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { legalContent, LEGAL_VERSION } from "@/lib/legal-content";
import "@/app/commerce.css";

export function LegalPage({ topic }: { topic: keyof typeof legalContent }) {
  const copy = legalContent[topic];
  return <div className="commerce-shell"><CommerceHeader /><main lang="it">
    <header className="commerce-hero company-hero"><p className="commerce-kicker">LCS / Informazioni · Italiano</p><h1>{copy.title}</h1><p className="commerce-hero-copy">{copy.intro}</p></header>
    <article className="returns-policy store-help-policy">
      {copy.sections.map((section, index) => <section key={section.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{section.title}</h2><p>{section.text}</p></div></section>)}
      <section><span>↗</span><div><h2>Approfondimenti</h2><ul>{copy.links.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul><p>Ultimo aggiornamento: <time dateTime={LEGAL_VERSION}>17 settembre 2026</time>.</p></div></section>
    </article>
  </main><StoreFooter /></div>;
}
