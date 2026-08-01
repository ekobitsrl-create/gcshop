"use client";
import { FormEvent, useState } from "react";

type Method={code:"paypal"|"bank_transfer";name:string;instructions:string;configured:boolean};
export function CheckoutForm({ methods }: { methods:Method[] }) {
  const available=methods.filter((m)=>m.configured); const [method,setMethod]=useState(available[0]?.code??""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const submit=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(form))});const payload=await response.json();setBusy(false);if(!response.ok){setError(payload.error??"Checkout non riuscito.");return;}window.location.href=payload.redirectUrl;};
  return <form className="checkout-form" onSubmit={submit}>
    <label>Nome<input required name="firstName" autoComplete="given-name"/></label><label>Cognome<input required name="lastName" autoComplete="family-name"/></label>
    <label>Email<input required type="email" name="email" autoComplete="email"/></label><label>Telefono<input required name="phone" autoComplete="tel"/></label>
    <label className="checkout-wide">Indirizzo<input required name="addressLine1" autoComplete="street-address"/></label><label>CAP<input required name="postalCode" autoComplete="postal-code"/></label><label>Città<input required name="city" autoComplete="address-level2"/></label><label>Provincia<input required name="province" autoComplete="address-level1"/></label><label>Paese<input required name="countryCode" defaultValue="IT" maxLength={2}/></label>
    <label className="checkout-wide">Note<textarea name="customerNote" rows={3}/></label>
    {methods.map((m)=><label className="payment-choice" key={m.code}><input type="radio" name="paymentMethod" value={m.code} checked={method===m.code} disabled={!m.configured} onChange={()=>setMethod(m.code)}/><span><strong>{m.name}</strong><br/>{m.instructions}{!m.configured&&<><br/><em>Configurazione amministratore necessaria.</em></>}</span></label>)}
    {!available.length&&<p className="checkout-message">Nessun metodo di pagamento è ancora configurato. Inserisci le credenziali PayPal o l’IBAN nell’ambiente protetto.</p>}
    {error&&<p className="checkout-message" role="alert">{error}</p>}<button className="checkout-submit" disabled={busy||!method}>{busy?"Elaborazione…":method==="paypal"?"Continua con PayPal":"Conferma ordine"}</button>
  </form>;
}
