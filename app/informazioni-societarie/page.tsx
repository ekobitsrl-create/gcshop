import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "../commerce.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "company.title"), description: translate(locale, "company.description"), alternates: { canonical: "/informazioni-societarie" } };
}

export default async function CompanyInformationPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero company-hero">
          <p className="commerce-kicker">LCS / Legal</p>
          <h1>{t("company.heroTitle")}<br /><em>{t("company.heroEmphasis")}</em></h1>
          <p className="commerce-hero-copy">{t("company.heroCopy")}</p>
        </header>
        <section className="commerce-main company-information" aria-label={t("company.dataLabel")}>
          <div>
            <p className="commerce-kicker">{t("company.operator")}</p>
            <h2>Ekobit SRL</h2>
          </div>
          <dl>
            <div><dt>{t("company.vat")}</dt><dd>02424510796</dd></div>
            <div><dt>{t("company.office")}</dt><dd>Via Firenze 185<br />88900 Crotone (KR), {t("company.italy")}</dd></div>
            <div><dt>{t("company.phone")}</dt><dd><a href="tel:+393381346675">+39 338 134 6675</a></dd></div>
            <div><dt>Email</dt><dd><a href="mailto:info@ekobit.it">info@ekobit.it</a></dd></div>
          </dl>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
