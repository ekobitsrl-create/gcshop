import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { carts, orders } from "@/db/schema";
import { CheckoutShell } from "@/components/checkout-shell";
import { CheckoutForm } from "@/components/checkout-form";
import { getCartSnapshot } from "@/lib/cart";
import { getPaymentMethods } from "@/lib/payment-config";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCountryOptions } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);
  const token = (await cookies()).get("lcs_cart")?.value;
  if (token && /^[0-9a-f-]{36}$/i.test(token)) {
    const [pending] = await getDb().select({ number: orders.orderNumber }).from(orders)
      .innerJoin(carts, eq(carts.id, orders.cartId))
      .where(and(eq(carts.token, token), eq(carts.status, "checkout"), eq(orders.paymentStatus, "pending"))).limit(1);
    if (pending) redirect(`/ordine/${encodeURIComponent(pending.number)}`);
  }
  const cart = await getCartSnapshot(token, locale);
  const methods = cart.items.length ? await getPaymentMethods() : [];

  return (
    <CheckoutShell empty={!cart.items.length}>
          {!cart.items.length ? (
            <div className="checkout-empty-state">
              <a href="/shop" className="checkout-pay-button">{t("checkout.discover")} <span aria-hidden="true">↗</span></a>
            </div>
          ) : (
            <CheckoutForm methods={methods} cart={cart} countries={getCountryOptions(locale)} />
          )}
    </CheckoutShell>
  );
}
