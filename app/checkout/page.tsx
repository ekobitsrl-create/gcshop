import { cookies } from "next/headers";
import { CommerceHeader } from "@/components/commerce-header";
import { CheckoutForm } from "@/components/checkout-form";
import { StoreFooter } from "@/components/store-footer";
import { getCartSnapshot } from "@/lib/cart";
import { getPaymentMethods } from "@/lib/payment-config";
import "../commerce.css";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const token = (await cookies()).get("lcs_cart")?.value;
  const cart = await getCartSnapshot(token);
  const methods = cart.items.length ? await getPaymentMethods() : [];

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="checkout-heading">
          <p className="commerce-kicker">Secure checkout / 01</p>
          <h1>La tua<br /><em>selezione.</em></h1>
          <p>Spedizione inclusa. Pagamenti protetti. Assistenza reale.</p>
        </header>
        <section className="commerce-main checkout-content">
          {!cart.items.length ? (
            <div className="commerce-empty checkout-empty">
              <div className="empty-number">00</div>
              <div><p className="commerce-kicker">Il carrello è vuoto</p><h2>Il primo pezzo<br /><em>è quello giusto.</em></h2><a href="/shop">Scopri la selezione <span>↗</span></a></div>
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
