import { CommerceHeader } from "@/components/commerce-header";
import { PayPalComplete } from "@/components/paypal-complete";
import "../../../commerce.css";
export default async function Page({searchParams}:{searchParams:Promise<{token?:string;order?:string}>}){const p=await searchParams;return <div className="commerce-shell"><CommerceHeader/><main className="commerce-main order-confirmation"><p className="commerce-kicker">PayPal</p><h1>Stiamo confermando il pagamento.</h1>{p.token&&p.order?<PayPalComplete token={p.token} orderNumber={p.order}/>:<p>Dati PayPal mancanti.</p>}</main></div>}
