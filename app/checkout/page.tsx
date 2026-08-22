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
          <p className="commerce-kicker">Checkout</p>
          <h1>La tua borsa</h1>
          <p>Controlla i prodotti e inserisci i dati per la consegna.</p>
        </header>
        <section className="commerce-main checkout-content">
          {!cart.items.length ? (
            <div className="commerce-empty checkout-empty">
              <div><p className="commerce-kicker">La borsa è vuota</p><h2>Non hai ancora aggiunto prodotti.</h2><a href="/shop">Vai allo shop <span>→</span></a></div>
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
