import { cookies } from "next/headers";
import { CommerceHeader } from "@/components/commerce-header";
import { CheckoutForm } from "@/components/checkout-form";
import { getCartSnapshot } from "@/lib/cart";
import { getPaymentMethods } from "@/lib/payment-config";
import { formatMoney } from "@/lib/store-utils";
import "../commerce.css";

export const dynamic="force-dynamic";
export default async function CheckoutPage(){const token=(await cookies()).get("lcs_cart")?.value;const [cart,methods]=await Promise.all([getCartSnapshot(token),getPaymentMethods()]);return <div className="commerce-shell"><CommerceHeader/><main className="commerce-main"><p className="commerce-kicker">Acquisto sicuro</p><h1 className="commerce-title">Checkout</h1>{!cart.items.length?<div className="commerce-empty"><h2>La tua borsa è vuota.</h2><a href="/shop">Scopri la selezione →</a></div>:<div className="checkout-layout"><section><CheckoutForm methods={methods}/></section><aside className="order-summary"><h2>Il tuo ordine</h2>{cart.items.map((i)=><div className="order-line" key={i.id}><span>{i.name}<small> × {i.quantity}</small></span><strong>{formatMoney(i.lineTotalCents,cart.currency)}</strong></div>)}<div className="order-line order-total"><span>Totale</span><strong>{formatMoney(cart.subtotalCents,cart.currency)}</strong></div><p>Spedizione inclusa. Imposte comprese.</p></aside></div>}</main></div>}
