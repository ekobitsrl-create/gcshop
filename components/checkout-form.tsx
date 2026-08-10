"use client";

import { type FormEvent, useState } from "react";

type Method = { code: "paypal" | "bank_transfer"; name: string; instructions: string; configured: boolean };

export function CheckoutForm({ methods }: { methods: Method[] }) {
  const available = methods.filter((method) => method.configured);
  const [method, setMethod] = useState(available[0]?.code ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Checkout non riuscito.");
        return;
      }
      window.location.href = payload.redirectUrl;
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      <div className="field-row">
        <label htmlFor="firstName">Nome<input id="firstName" required name="firstName" autoComplete="given-name" /></label>
        <label htmlFor="lastName">Cognome<input id="lastName" required name="lastName" autoComplete="family-name" /></label>
      </div>
      <div className="field-row">
        <label htmlFor="email">Email<input id="email" required type="email" name="email" autoComplete="email" /></label>
        <label htmlFor="phone">Telefono<input id="phone" required name="phone" autoComplete="tel" /></label>
      </div>
      <label htmlFor="addressLine1">Indirizzo<input id="addressLine1" required name="addressLine1" autoComplete="street-address" /></label>
      <div className="field-row field-row-three">
        <label htmlFor="postalCode">CAP<input id="postalCode" required name="postalCode" autoComplete="postal-code" /></label>
        <label htmlFor="city">Città<input id="city" required name="city" autoComplete="address-level2" /></label>
        <label htmlFor="province">Provincia<input id="province" required name="province" autoComplete="address-level1" /></label>
      </div>
      <label className="country-field" htmlFor="countryCode">Paese<input id="countryCode" required name="countryCode" defaultValue="IT" maxLength={2} /></label>
      <label htmlFor="customerNote">Note per l’ordine <textarea id="customerNote" name="customerNote" rows={3} /></label>

      <fieldset className="payment-methods">
        <legend>Metodo di pagamento</legend>
        {methods.map((item) => (
          <label className={`payment-choice ${method === item.code ? "is-selected" : ""}`} key={item.code}>
            <input type="radio" name="paymentMethod" value={item.code} checked={method === item.code} disabled={!item.configured} onChange={() => setMethod(item.code)} />
            <span><strong>{item.name}</strong><small>{item.instructions}</small>{!item.configured ? <em>Configurazione amministratore necessaria.</em> : null}</span>
            <b aria-hidden="true">{item.code === "paypal" ? "PP" : "BT"}</b>
          </label>
        ))}
      </fieldset>

      {!available.length ? <p className="checkout-message">Nessun metodo di pagamento è ancora configurato. Inserisci le credenziali PayPal o l’IBAN nell’ambiente protetto.</p> : null}
      {error ? <p className="checkout-message" role="alert">{error}</p> : null}
      <button className="checkout-submit" disabled={busy || !method}>{busy ? "Elaborazione…" : method === "paypal" ? "Continua con PayPal" : "Conferma ordine"}<span>↗</span></button>
    </form>
  );
}
