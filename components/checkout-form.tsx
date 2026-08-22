"use client";

import { type FormEvent, useState } from "react";
import { formatMoney } from "@/lib/store-utils";

type Method = { code: "stripe" | "paypal" | "bank_transfer"; name: string; instructions: string; configured: boolean };
type Cart = {
  currency: string;
  itemCount: number;
  subtotalCents: number;
  items: Array<{ id: string; name: string; quantity: number; lineTotalCents: number }>;
};
type AppliedCoupon = { code: string; discountCents: number; totalCents: number };

export function CheckoutForm({ methods, cart }: { methods: Method[]; cart: Cart }) {
  const available = methods.filter((item) => item.configured);
  const [method, setMethod] = useState(available[0]?.code ?? "");
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateCouponCode(value: string) {
    setCouponCode(value.toUpperCase());
    if (coupon && value.toUpperCase() !== coupon.code) setCoupon(null);
    setCouponMessage("");
  }

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setCouponMessage("Inserisci un codice sconto.");
      return;
    }
    setCouponBusy(true);
    setCouponMessage("");
    try {
      const response = await fetch("/api/checkout/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setCoupon(null);
        setCouponMessage(payload.error ?? "Codice non valido.");
        return;
      }
      setCoupon({ code: payload.code, discountCents: payload.discountCents, totalCents: payload.totalCents });
      setCouponCode(payload.code);
      setCouponMessage(`${payload.code} applicato: hai risparmiato ${formatMoney(payload.discountCents, cart.currency)}.`);
    } catch {
      setCoupon(null);
      setCouponMessage("Il codice non può essere verificato in questo momento.");
    } finally {
      setCouponBusy(false);
    }
  }

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
    } catch {
      setError("Checkout temporaneamente non disponibile. Riprova tra poco.");
    } finally {
      setBusy(false);
    }
  }

  const totalCents = coupon?.totalCents ?? cart.subtotalCents;

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <section className="checkout-form-panel">
        <h2>Dati di spedizione</h2>
        <div className="checkout-form">
          <div className="field-row">
            <label htmlFor="firstName">Nome<input id="firstName" required name="firstName" autoComplete="given-name" /></label>
            <label htmlFor="lastName">Cognome<input id="lastName" required name="lastName" autoComplete="family-name" /></label>
          </div>
          <div className="field-row">
            <label htmlFor="email">Email<input id="email" required type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
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

          <section className="discount-panel" aria-labelledby="discount-title">
            <div>
              <p className="commerce-kicker">Primo ordine</p>
              <h3 id="discount-title">Il tuo codice sconto</h3>
              <p>Inserisci <strong>WELCOME10</strong> e ottieni il 10% sulla prima selezione.</p>
            </div>
            <div className="discount-entry">
              <label htmlFor="couponCode">Codice promozionale</label>
              <div>
                <input id="couponCode" name="couponCode" value={couponCode} onChange={(event) => updateCouponCode(event.target.value)} autoComplete="off" placeholder="WELCOME10" aria-describedby="coupon-feedback" />
                <button type="button" disabled={couponBusy} onClick={() => void applyCoupon()}>{couponBusy ? "Verifica…" : "Applica"}</button>
              </div>
              {couponMessage ? <p id="coupon-feedback" className={coupon ? "is-success" : ""} role="status">{couponMessage}</p> : null}
            </div>
          </section>

          <fieldset className="payment-methods">
            <legend>Metodo di pagamento</legend>
            {methods.map((item) => (
              <label className={`payment-choice ${method === item.code ? "is-selected" : ""}`} key={item.code}>
                <input type="radio" name="paymentMethod" value={item.code} checked={method === item.code} disabled={!item.configured} onChange={() => setMethod(item.code)} />
                <span><strong>{item.name}</strong><small>{item.instructions}</small>{!item.configured ? <em>Configurazione amministratore necessaria.</em> : null}</span>
                <b aria-hidden="true">{item.code === "stripe" ? "S" : item.code === "paypal" ? "PP" : "BT"}</b>
              </label>
            ))}
          </fieldset>

          {!available.length ? <p className="checkout-message">Nessun metodo di pagamento è ancora configurato. Le credenziali vanno inserite nell’ambiente protetto.</p> : null}
          {error ? <p className="checkout-message" role="alert">{error}</p> : null}
          <button className="checkout-submit" disabled={busy || !method}>{busy ? "Elaborazione…" : method === "stripe" ? "Paga in sicurezza" : method === "paypal" ? "Continua con PayPal" : "Conferma ordine"}<span>↗</span></button>
        </div>
      </section>

      <aside className="order-summary">
        <div className="summary-heading"><p>Il tuo ordine</p><span>{String(cart.itemCount).padStart(2, "0")}</span></div>
        {cart.items.map((item) => <div className="order-line" key={item.id}><span>{item.name}<small> × {item.quantity}</small></span><strong>{formatMoney(item.lineTotalCents, cart.currency)}</strong></div>)}
        <div className="order-line"><span>Spedizione</span><strong>Inclusa</strong></div>
        {coupon ? <div className="order-line order-discount"><span>Sconto · {coupon.code}</span><strong>−{formatMoney(coupon.discountCents, cart.currency)}</strong></div> : null}
        <div className="order-line order-total"><span>Totale</span><strong>{formatMoney(totalCents, cart.currency)}</strong></div>
        <p className="summary-note">Imposte comprese. Riceverai la conferma all’indirizzo email indicato.</p>
      </aside>
    </form>
  );
}
