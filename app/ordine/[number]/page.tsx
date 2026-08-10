import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { getBankTransferDetails } from "@/lib/payment-config";
import { formatMoney } from "@/lib/store-utils";
import "../../commerce.css";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const db = getDb();
  const result = await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1);
  if (!result.length) notFound();
  const order = result[0];
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const bank = getBankTransferDetails();

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="commerce-main order-confirmation">
        <p className="commerce-kicker">Ordine {order.orderNumber}</p>
        <h1>Grazie per<br /><em>il tuo acquisto.</em></h1>
        <p>Abbiamo registrato l’ordine per <strong>{order.email}</strong>.</p>
        {items.map((item) => <div className="order-line" key={item.id}><span>{item.productName} × {item.quantity}</span><strong>{formatMoney(item.totalCents, order.currency)}</strong></div>)}
        <div className="order-line order-total"><span>Totale</span><strong>{formatMoney(order.totalCents, order.currency)}</strong></div>
        {order.paymentMethodCode === "bank_transfer" ? <div className="bank-details"><strong>Pagamento tramite bonifico</strong><br />Intestatario: {bank.accountHolder}<br />IBAN: {bank.iban}<br />{bank.bic ? <>BIC: {bank.bic}<br /></> : null}Causale: {order.orderNumber}<p>L’ordine sarà preparato dopo la conferma dell’accredito.</p></div> : null}
      </main>
      <StoreFooter />
    </div>
  );
}
