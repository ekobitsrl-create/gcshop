import { CommerceHeader } from "@/components/commerce-header";
import { PayPalComplete } from "@/components/paypal-complete";
import { StoreFooter } from "@/components/store-footer";
import "../../../commerce.css";

export default async function PayPalCompletePage({ searchParams }: { searchParams: Promise<{ token?: string; order?: string }> }) {
  const params = await searchParams;
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="commerce-main order-confirmation">
        <p className="commerce-kicker">PayPal / Verifica</p>
        <h1>Stiamo confermando<br /><em>il pagamento.</em></h1>
        {params.token && params.order ? <PayPalComplete token={params.token} orderNumber={params.order} /> : <p>Dati PayPal mancanti.</p>}
      </main>
      <StoreFooter />
    </div>
  );
}
