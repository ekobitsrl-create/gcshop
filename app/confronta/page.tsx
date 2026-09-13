import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { ComparisonPanel } from "@/components/comparison-panel";
import { StoreFooter } from "@/components/store-footer";
import { getRequestLocale } from "@/lib/i18n-server";
import { translate } from "@/lib/i18n";
import "../commerce.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: translate(await getRequestLocale(), "compare.label"), robots: { index: false, follow: true } };
}

export default async function ComparisonPage() {
  const locale = await getRequestLocale();
  return <div className="commerce-shell"><CommerceHeader /><main className="compare-page">
    <header className="compare-hero"><p className="commerce-kicker">{translate(locale, "compare.label")} / 02</p><h1>{translate(locale, "compare.title")}</h1><p>{translate(locale, "compare.intro")}</p></header>
    <ComparisonPanel />
  </main><StoreFooter /></div>;
}
