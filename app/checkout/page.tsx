import { cookies } from "next/headers";
import { CommerceHeader } from "@/components/commerce-header";
import { CheckoutForm } from "@/components/checkout-form";
import { StoreFooter } from "@/components/store-footer";
import { getCartSnapshot } from "@/lib/cart";
import { getPaymentMethods } from "@/lib/payment-config";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "../commerce.css";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);
  const token = (await cookies()).get("lcs_cart")?.value;
  const cart = await getCartSnapshot(token, locale);
  const methods = cart.items.length ? await getPaymentMethods() : [];

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="checkout-heading">
          <p className="commerce-kicker">{t("checkout.secureKicker")}</p>
          <h1>{t("checkout.heroTitle")}<br /><em>{t("checkout.heroEmphasis")}</em></h1>
          <p>{t("checkout.heroCopy")}</p>
        </header>
        <section className="commerce-main checkout-content">
          {!cart.items.length ? (
            <div className="commerce-empty checkout-empty">
              <div className="empty-number">00</div>
              <div><p className="commerce-kicker">{t("checkout.empty")}</p><h2>{t("checkout.emptyTitle")}<br /><em>{t("checkout.emptyEmphasis")}</em></h2><a href="/shop">{t("checkout.discover")} <span>↗</span></a></div>
            </div>
          ) : (
            <CheckoutForm methods={methods} cart={cart} />
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
