import { cookies } from "next/headers";
import { CommerceHeader } from "@/components/commerce-header";
import { CheckoutForm } from "@/components/checkout-form";
import { StoreFooter } from "@/components/store-footer";
import { getCartSnapshot } from "@/lib/cart";
import { getPaymentMethods } from "@/lib/payment-config";
import { formatMoney } from "@/lib/store-utils";
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
              <div><p className="commerce-kicker">La borsa è vuota</p><h2>Il primo pezzo<br /><em>è quello giusto.</em></h2><a href="/shop">Scopri la selezione <span>↗</span></a></div>
            </div>
          ) : (
            <div className="checkout-layout">
              <section className="checkout-form-panel"><h2>Dati di spedizione</h2><CheckoutForm methods={methods} /></section>
              <aside className="order-summary">
                <div className="summary-heading"><p>Il tuo ordine</p><span>{String(cart.itemCount).padStart(2, "0")}</span></div>
                {cart.items.map((item) => <div className="order-line" key={item.id}><span>{item.name}<small> × {item.quantity}</small></span><strong>{formatMoney(item.lineTotalCents, cart.currency)}</strong></div>)}
                <div className="order-line"><span>Spedizione</span><strong>Inclusa</strong></div>
                <div className="order-line order-total"><span>Totale</span><strong>{formatMoney(cart.subtotalCents, cart.currency)}</strong></div>
                <p className="summary-note">Imposte comprese. Riceverai la conferma all’indirizzo email indicato.</p>
              </aside>
            </div>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
