import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { getRequestLocale } from "@/lib/i18n-server";
import { paymentHelp, sizeHelp } from "@/lib/store-help";
import "@/app/commerce.css";

export async function StoreHelpPage({ topic }: { topic: "size" | "payment" }) {
  const locale = await getRequestLocale();
  const copy = (topic === "size" ? sizeHelp : paymentHelp)[locale];
  return <div className="commerce-shell">
    <CommerceHeader />
    <main>
      <header className="commerce-hero company-hero"><p className="commerce-kicker">LCS / Client service</p><h1>{copy.title}</h1><p className="commerce-hero-copy">{copy.intro}</p></header>
      <article className="returns-policy store-help-policy">
        {copy.sections.map((section, index) => <section key={section.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{section.title}</h2><p>{section.text}</p></div></section>)}
        <section><span>↗</span><div><p><a href={`mailto:info@ekobit.it?subject=${encodeURIComponent(`LCS — ${copy.title}`)}`}>{copy.contact}</a></p><p><a href="/shop">{copy.back}</a></p></div></section>
      </article>
    </main><StoreFooter />
  </div>;
}
