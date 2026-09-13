import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { carts, orderItems, orders, paymentTransactions } from "@/db/schema";
import { getStripe, readBankInstructions, readStripeState } from "@/lib/stripe";
import type { BankInstructions } from "@/lib/stripe-checkout";
import { applyStripeSession } from "@/lib/stripe-orders";
import { StripeOrderStatus } from "@/components/stripe-order-status";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { getBankTransferDetails } from "@/lib/payment-config";
import { formatMoney } from "@/lib/store-utils";
import { localeTags, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "../../commerce.css";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const locale = await getRequestLocale();
  const localeTag = localeTags[locale];
  const t = (key: string, values?: Record<string, string | number>) => translate(locale, key, values);
  const db = getDb();
  const result = await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1);
  if (!result.length) notFound();
  let order = result[0];
  const [transaction] = await db.select().from(paymentTransactions).where(and(eq(paymentTransactions.orderId, order.id), eq(paymentTransactions.type, "stripe_checkout"))).limit(1);
  const stripeState = transaction && readStripeState(transaction.responseJson);
  let bankInstructions: BankInstructions | null = null;
  if (stripeState && transaction.providerReference && order.paymentStatus === "pending") {
    try {
      const session = await getStripe().checkout.sessions.retrieve(transaction.providerReference, { expand: ["payment_intent.latest_charge"] });
      await applyStripeSession(session, "sync");
      bankInstructions = readBankInstructions(session);
      [order] = await db.select().from(orders).where(eq(orders.id, order.id));
    } catch { /* Webhook retries will reconcile temporary provider or database outages. */ }
  }
  const token = (await cookies()).get("lcs_cart")?.value;
  const ownedCart = order.cartId && token && /^[0-9a-f-]{36}$/i.test(token)
    ? await db.select({ id: carts.id }).from(carts).where(and(eq(carts.id, order.cartId), eq(carts.token, token))).limit(1) : [];
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const bank = getBankTransferDetails();

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="commerce-main order-confirmation">
        <p className="commerce-kicker">{t("order.label", { number: order.orderNumber })}</p>
        <h1>{t("order.thanks")}<br /><em>{t("order.thanksEmphasis")}</em></h1>
        <p>{t("order.registered", { email: order.email })}</p>
        {items.map((item) => <div className="order-line" key={item.id}><span>{item.productName} × {item.quantity}</span><strong>{formatMoney(item.totalCents, order.currency, localeTag)}</strong></div>)}
        <div className="order-line order-total"><span>{t("common.total")}</span><strong>{formatMoney(order.totalCents, order.currency, localeTag)}</strong></div>
        {stripeState ? <StripeOrderStatus orderNumber={order.orderNumber} status={order.paymentStatus} canResume={Boolean(ownedCart.length)} bankInstructions={ownedCart.length ? bankInstructions : null} /> : order.paymentMethodCode === "bank_transfer" ? <div className="bank-details"><strong>{t("order.bankTitle")}</strong><br />{t("order.accountHolder")}: {bank.accountHolder}<br />IBAN: {bank.iban}<br />{bank.bic ? <>BIC: {bank.bic}<br /></> : null}{t("order.reference")}: {order.orderNumber}<p>{t("order.bankCopy")}</p></div> : null}
      </main>
      <StoreFooter />
    </div>
  );
}
