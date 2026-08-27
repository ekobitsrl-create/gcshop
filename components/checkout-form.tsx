"use client";

import { type FormEvent, useState } from "react";
import { formatMoney } from "@/lib/store-utils";
import { useI18n } from "@/components/locale-provider";

type Method = { code: "paypal" | "bank_transfer"; name: string; instructions: string; configured: boolean };
type Cart = {
  currency: string;
  itemCount: number;
  subtotalCents: number;
  items: Array<{ id: string; name: string; quantity: number; lineTotalCents: number }>;
};
type AppliedCoupon = { code: string; discountCents: number; totalCents: number };

export function CheckoutForm({ methods, cart }: { methods: Method[]; cart: Cart }) {
  const { localeTag, t } = useI18n();
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
      setCouponMessage(t("checkout.enterCode"));
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
        setCouponMessage(t("checkout.invalidCode"));
        return;
      }
      setCoupon({ code: payload.code, discountCents: payload.discountCents, totalCents: payload.totalCents });
      setCouponCode(payload.code);
      setCouponMessage(t("checkout.couponApplied", { code: payload.code, amount: formatMoney(payload.discountCents, cart.currency, localeTag) }));
    } catch {
      setCoupon(null);
      setCouponMessage(t("checkout.couponUnavailable"));
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
        setError(t("checkout.failed"));
        return;
      }
      window.location.href = payload.redirectUrl;
    } catch {
      setError(t("checkout.unavailable"));
    } finally {
      setBusy(false);
    }
  }

  const totalCents = coupon?.totalCents ?? cart.subtotalCents;

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <section className="checkout-form-panel">
        <h2>{t("checkout.shippingData")}</h2>
        <div className="checkout-form">
          <div className="field-row">
            <label htmlFor="firstName">{t("checkout.firstName")}<input id="firstName" required name="firstName" autoComplete="given-name" /></label>
            <label htmlFor="lastName">{t("checkout.lastName")}<input id="lastName" required name="lastName" autoComplete="family-name" /></label>
          </div>
          <div className="field-row">
            <label htmlFor="email">Email<input id="email" required type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label htmlFor="phone">{t("checkout.phone")}<input id="phone" required name="phone" autoComplete="tel" /></label>
          </div>
          <label htmlFor="addressLine1">{t("checkout.address")}<input id="addressLine1" required name="addressLine1" autoComplete="street-address" /></label>
          <div className="field-row field-row-three">
            <label htmlFor="postalCode">{t("checkout.postalCode")}<input id="postalCode" required name="postalCode" autoComplete="postal-code" /></label>
            <label htmlFor="city">{t("checkout.city")}<input id="city" required name="city" autoComplete="address-level2" /></label>
            <label htmlFor="province">{t("checkout.province")}<input id="province" required name="province" autoComplete="address-level1" /></label>
          </div>
          <label className="country-field" htmlFor="countryCode">{t("checkout.country")}<input id="countryCode" required name="countryCode" defaultValue="IT" maxLength={2} /></label>
          <label htmlFor="customerNote">{t("checkout.orderNotes")} <textarea id="customerNote" name="customerNote" rows={3} /></label>

          <section className="discount-panel" aria-labelledby="discount-title">
            <div>
              <p className="commerce-kicker">{t("checkout.firstOrder")}</p>
              <h3 id="discount-title">{t("checkout.discountTitle")}</h3>
              <p>{t("checkout.discountCopy")}</p>
            </div>
            <div className="discount-entry">
              <label htmlFor="couponCode">{t("checkout.promoCode")}</label>
              <div>
                <input id="couponCode" name="couponCode" value={couponCode} onChange={(event) => updateCouponCode(event.target.value)} autoComplete="off" placeholder="WELCOME10" aria-describedby="coupon-feedback" />
                <button type="button" disabled={couponBusy} onClick={() => void applyCoupon()}>{couponBusy ? t("checkout.verify") : t("checkout.apply")}</button>
              </div>
              {couponMessage ? <p id="coupon-feedback" className={coupon ? "is-success" : ""} role="status">{couponMessage}</p> : null}
            </div>
          </section>

          <fieldset className="payment-methods">
            <legend>{t("checkout.paymentMethod")}</legend>
            {methods.map((item) => (
              <label className={`payment-choice ${method === item.code ? "is-selected" : ""}`} key={item.code}>
                <input type="radio" name="paymentMethod" value={item.code} checked={method === item.code} disabled={!item.configured} onChange={() => setMethod(item.code)} />
                <span><strong>{item.code === "paypal" ? t("checkout.paypalName") : t("checkout.bankName")}</strong><small>{item.code === "paypal" ? t("checkout.paypalInstructions") : t("checkout.bankInstructions")}</small>{!item.configured ? <em>{t("checkout.adminRequired")}</em> : null}</span>
                <b aria-hidden="true">{item.code === "paypal" ? "PP" : "BT"}</b>
              </label>
            ))}
          </fieldset>

          {!available.length ? <p className="checkout-message">{t("checkout.noPayment")}</p> : null}
          {error ? <p className="checkout-message" role="alert">{error}</p> : null}
          <button className="checkout-submit" disabled={busy || !method}>{busy ? t("checkout.processing") : method === "paypal" ? t("checkout.continuePaypal") : t("checkout.confirmOrder")}<span>↗</span></button>
        </div>
      </section>

      <aside className="order-summary">
        <div className="summary-heading"><p>{t("checkout.yourOrder")}</p><span>{String(cart.itemCount).padStart(2, "0")}</span></div>
        {cart.items.map((item) => <div className="order-line" key={item.id}><span>{item.name}<small> × {item.quantity}</small></span><strong>{formatMoney(item.lineTotalCents, cart.currency, localeTag)}</strong></div>)}
        <div className="order-line"><span>{t("checkout.shipping")}</span><strong>{t("checkout.included")}</strong></div>
        {coupon ? <div className="order-line order-discount"><span>{t("checkout.discount")} · {coupon.code}</span><strong>−{formatMoney(coupon.discountCents, cart.currency, localeTag)}</strong></div> : null}
        <div className="order-line order-total"><span>{t("common.total")}</span><strong>{formatMoney(totalCents, cart.currency, localeTag)}</strong></div>
        <p className="summary-note">{t("checkout.taxNote")}</p>
      </aside>
    </form>
  );
}
