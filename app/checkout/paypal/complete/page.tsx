import { CommerceHeader } from "@/components/commerce-header";
import { PayPalComplete } from "@/components/paypal-complete";
import { StoreFooter } from "@/components/store-footer";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "../../../commerce.css";

export default async function PayPalCompletePage({ searchParams }: { searchParams: Promise<{ token?: string; order?: string }> }) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="commerce-main order-confirmation">
        <p className="commerce-kicker">{t("paypal.verify")}</p>
        <h1>{t("paypal.checking")}<br /><em>{t("paypal.payment")}</em></h1>
        {params.token && params.order ? <PayPalComplete token={params.token} orderNumber={params.order} /> : <p>{t("paypal.missing")}</p>}
      </main>
      <StoreFooter />
    </div>
  );
}
