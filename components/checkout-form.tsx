"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeCheckoutLoadActionsSuccess } from "@stripe/stripe-js";
import { formatMoney } from "@/lib/store-utils";
import { useI18n } from "@/components/locale-provider";
import { CheckoutIcon } from "@/components/checkout-shell";
import type { CountryOption } from "@/lib/countries";
import { confirmLocalPayment, getBrowserStripe, loadCheckoutActions } from "@/lib/stripe-browser";
import type { CheckoutLaunch, PaymentMethodCode } from "@/lib/stripe-checkout";

type Method = { code: PaymentMethodCode; configured: boolean };
type Cart = {
  currency: string; itemCount: number; subtotalCents: number;
  items: Array<{ id: string; name: string; quantity: number; lineTotalCents: number; imageUrl?: string | null; variantName?: string | null }>;
};
type AppliedCoupon = { code: string; discountCents: number; totalCents: number };

type Props = { methods: Method[]; cart: Cart; countries: CountryOption[] };

export function CheckoutForm(props: Props) {
  const { locale } = useI18n();
  return <Elements stripe={getBrowserStripe(locale)} options={{ mode: "payment", amount: Math.max(50, props.cart.subtotalCents), currency: props.cart.currency.toLowerCase(), paymentMethodTypes: ["card"], paymentMethodCreation: "manual", locale,
    appearance: { theme: "stripe", variables: { colorPrimary: "#324954", colorText: "#111210", borderRadius: "4px", fontFamily: "Arial, sans-serif", fontSizeBase: "16px" } },
  }}><CheckoutFormBody {...props} /></Elements>;
}

function CheckoutFormBody({ methods, cart, countries }: Props) {
  const { locale, localeTag, t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const available = methods.filter((item) => item.configured);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>(available[0]?.code ?? methods[0]?.code ?? "card");
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentLoadError, setPaymentLoadError] = useState(false);
  const [reserved, setReserved] = useState(false);
  const reservedInput = useRef<Record<string, FormDataEntryValue> | null>(null);
  const checkoutActions = useRef<{ secret: string; promise: Promise<StripeCheckoutLoadActionsSuccess> } | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<{ amount: string; cents: number; currency: string } | null>(null);
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const couponRequest = useRef(0);
  const submitInFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const totalCents = confirmedTotal?.cents ?? coupon?.totalCents ?? cart.subtotalCents;
  const canPay = available.some((method) => method.code === paymentMethod) && Boolean(stripe) && (paymentMethod !== "card" || paymentReady);
  const hasConfiguredMethods = available.length > 0;

  useEffect(() => {
    elements?.update({ amount: Math.max(50, totalCents) });
  }, [elements, totalCents]);

  useEffect(() => {
    if (stripe || !hasConfiguredMethods) return;
    const timer = setTimeout(() => setPaymentLoadError(true), 12000);
    return () => clearTimeout(timer);
  }, [stripe, hasConfiguredMethods]);

  function resetCoupon() {
    couponRequest.current += 1;
    setCoupon(null); setCouponMessage(""); setCouponBusy(false);
  }

  async function applyCoupon() {
    if (!couponCode.trim()) { setCouponMessage(t("checkout.enterCode")); return; }
    const requestId = ++couponRequest.current;
    setCouponBusy(true); setCouponMessage("");
    try {
      const response = await fetch("/api/checkout/coupon", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode, email }),
      });
      const payload = await response.json();
      if (requestId !== couponRequest.current) return;
      if (!response.ok) {
        setCoupon(null); setCouponMessage(locale === "it" && typeof payload.error === "string" ? payload.error : t("checkout.invalidCode")); return;
      }
      setCoupon({ code: payload.code, discountCents: payload.discountCents, totalCents: payload.totalCents });
      setCouponCode(payload.code);
      setCouponMessage(t("checkout.couponApplied", { code: payload.code, amount: formatMoney(payload.discountCents, cart.currency, localeTag) }));
    } catch {
      if (requestId === couponRequest.current) setCouponMessage(t("checkout.couponUnavailable"));
    } finally { if (requestId === couponRequest.current) setCouponBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitInFlight.current || couponBusy || !canPay || !stripe || !elements) return;
    const body = reservedInput.current ?? Object.fromEntries(new FormData(event.currentTarget));
    submitInFlight.current = true; setBusy(true); setError("");
    try {
      const billing = { name: `${body.firstName} ${body.lastName}`, email: String(body.email), phone: String(body.phone), address: {
        line1: String(body.addressLine1), postal_code: String(body.postalCode), city: String(body.city), state: String(body.province), country: String(body.countryCode),
      } };
      let paymentMethodId: string | undefined;
      if (paymentMethod === "card") {
        const submitted = await elements.submit();
        if (submitted.error) throw new Error(submitted.error.message || t("checkout.failed"));
        const created = await stripe.createPaymentMethod({ elements, params: { billing_details: billing } });
        if (created.error) throw new Error(created.error.message || t("checkout.failed"));
        paymentMethodId = created.paymentMethod.id;
      } else if (paymentMethod === "paypal") {
        const created = await stripe.createPaymentMethod({ type: "paypal", billing_details: billing });
        if (created.error) throw new Error(created.error.message || t("checkout.failed"));
        paymentMethodId = created.paymentMethod.id;
      }
      const response = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, paymentMethod }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (typeof payload.orderUrl === "string" && payload.orderUrl.startsWith("/ordine/")) { window.location.assign(payload.orderUrl); return; }
        throw new Error(locale === "it" && typeof payload.error === "string" ? payload.error : t("checkout.failed"));
      }
      const launch = payload as CheckoutLaunch;
      if (launch.type === "redirect") { window.location.assign(launch.redirectUrl); return; }
      if (launch.type !== "custom" || !launch.clientSecret) throw new Error(t("checkout.failed"));
      reservedInput.current = body; setReserved(true);
      paymentMethodId ??= launch.paymentMethodId;
      if (!paymentMethodId) throw new Error(t("checkout.failed"));
      if (checkoutActions.current?.secret !== launch.clientSecret) checkoutActions.current = { secret: launch.clientSecret, promise: loadCheckoutActions(stripe, launch.clientSecret) };
      const actions = await checkoutActions.current.promise;
      const result = await confirmLocalPayment(actions, paymentMethodId, { amount: totalCents, currency: cart.currency }, (total) => flushSync(() => setConfirmedTotal(total)));
      if (result.type === "total_changed") throw new Error(t("checkoutV2.totalChanged"));
      if (result.type === "error") throw new Error(result.error.message);
      window.location.assign(launch.orderUrl);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("checkout.unavailable")); submitInFlight.current = false; setBusy(false);
      // A failed SDK initialization can be retried with the same server session.
      if (checkoutActions.current) void checkoutActions.current.promise.catch(() => { checkoutActions.current = null; });
    }
  }

  return <form className="checkout-grid" onSubmit={submit} aria-busy={busy}>
    <div className="checkout-fields">
      <fieldset className="checkout-section" disabled={busy || reserved}>
        <legend><span>01</span>{t("checkoutV2.contact")}</legend>
        <p className="checkout-section-note">{t("checkoutV2.contactCopy")}</p>
        <div className="checkout-row">
          <label htmlFor="email">Email<input id="email" required type="email" name="email" autoComplete="email" maxLength={250} value={email} onChange={(event) => { setEmail(event.target.value); resetCoupon(); }} placeholder="nome@email.it" /></label>
          <label htmlFor="phone">{t("checkout.phone")}<input id="phone" required type="tel" name="phone" autoComplete="tel" maxLength={250} /></label>
        </div>
      </fieldset>
      <fieldset className="checkout-section" disabled={busy || reserved}>
        <legend><span>02</span>{t("checkoutV2.shipping")}</legend>
        <div className="checkout-row">
          <label htmlFor="firstName">{t("checkout.firstName")}<input id="firstName" required name="firstName" autoComplete="given-name" maxLength={250} /></label>
          <label htmlFor="lastName">{t("checkout.lastName")}<input id="lastName" required name="lastName" autoComplete="family-name" maxLength={250} /></label>
        </div>
        <label htmlFor="addressLine1">{t("checkout.address")}<input id="addressLine1" required name="addressLine1" autoComplete="address-line1" maxLength={250} /></label>
        <div className="checkout-row checkout-address-row">
          <label htmlFor="postalCode">{t("checkout.postalCode")}<input id="postalCode" required name="postalCode" autoComplete="postal-code" maxLength={250} /></label>
          <label htmlFor="city">{t("checkout.city")}<input id="city" required name="city" autoComplete="address-level2" maxLength={250} /></label>
          <label htmlFor="province">{t("checkout.province")}<input id="province" required name="province" autoComplete="address-level1" maxLength={250} /></label>
        </div>
        <label htmlFor="countryCode">{t("checkout.country")}<select id="countryCode" required name="countryCode" defaultValue="IT" autoComplete="country">{countries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}</select></label>
        <details className="checkout-notes"><summary>{t("checkoutV2.addNote")} <span>{t("checkoutV2.optional")}</span></summary><label htmlFor="customerNote">{t("checkout.orderNotes")}<textarea id="customerNote" name="customerNote" rows={3} maxLength={2000} /></label></details>
        <div className="checkout-delivery"><CheckoutIcon name="truck" /><div><strong>{t("checkoutV2.deliveryTitle")}</strong><span>{t("checkoutV2.deliveryCopy")}</span></div></div>
      </fieldset>
      <section className="checkout-payment" aria-labelledby="payment-title">
        <h2 id="payment-title"><span>03</span>{t("checkout.paymentMethod")}</h2>
        <label htmlFor="paymentMethod">{t("checkoutV2.chooseMethod")}<select id="paymentMethod" value={paymentMethod} disabled={busy} onChange={(event) => { setPaymentMethod(event.target.value as PaymentMethodCode); setError(""); }}>
          {methods.map((method) => <option key={method.code} value={method.code} disabled={!method.configured}>{t(method.code === "card" ? "checkoutV2.card" : method.code === "paypal" ? "checkout.paypalName" : "checkout.bankName")}</option>)}
        </select></label>
        {methods.some((method) => method.code === "card") ? <div className="checkout-card-fields" hidden={paymentMethod !== "card"} aria-busy={!paymentReady}>
          {available.some((method) => method.code === "card") ? <PaymentElement options={{ layout: "tabs", fields: { billingDetails: { name: "never", email: "never", phone: "never", address: "never" } }, wallets: { applePay: "never", googlePay: "never" } }} onReady={() => { setPaymentReady(true); setPaymentLoadError(false); }} onLoadError={() => { setPaymentLoadError(true); setPaymentReady(false); }} /> : null}
          {!paymentReady ? <p className="checkout-payment-note" role="status">{t(paymentLoadError || !available.length ? "checkoutV2.unavailable" : "checkoutV2.loadingFields")}</p> : null}
        </div> : null}
        {paymentMethod !== "card" ? <p className="checkout-payment-note">{t(paymentMethod === "paypal" ? "checkoutV2.paypalCopy" : "checkoutV2.bankCopy")}</p> : null}
        <p className="checkout-payment-security"><CheckoutIcon name="lock" />{t("checkoutV2.paymentSecurity")}</p>
        {reserved ? <p className="checkout-payment-note" role="status">{t("checkoutV2.reserved")}</p> : null}
      </section>
    </div>
    <aside className="checkout-summary" aria-labelledby="summary-title">
      <div className="checkout-summary-heading"><h2 id="summary-title">{t("checkout.yourOrder")}</h2><span>{String(cart.itemCount).padStart(2, "0")}</span></div>
      <ul className="checkout-products">{cart.items.map((item) => <li key={item.id}>
        <div className="checkout-product-image">{item.imageUrl ? <Image src={item.imageUrl} alt="" width={72} height={90} unoptimized /> : <CheckoutIcon name="bag" />}</div>
        <div className="checkout-product-info"><strong>{item.name}</strong>{item.variantName && item.variantName !== "Standard" ? <span>{item.variantName}</span> : null}<small>{t("checkoutV2.quantity", { count: item.quantity })}</small></div>
        <b>{formatMoney(item.lineTotalCents, cart.currency, localeTag)}</b>
      </li>)}</ul>
      <details className="checkout-coupon"><summary>{t("checkoutV2.haveCoupon")}<span aria-hidden="true">+</span></summary>
        <p>{t("checkout.discountCopy")}</p>
        <label htmlFor="couponCode">{t("checkout.promoCode")}</label>
        <div className="checkout-coupon-entry"><input id="couponCode" value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); resetCoupon(); }} disabled={busy || reserved} autoComplete="off" placeholder="WELCOME10" aria-describedby="coupon-feedback" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (!couponBusy && !busy && !reserved) void applyCoupon(); } }} /><button type="button" disabled={couponBusy || busy || reserved} onClick={() => void applyCoupon()}>{t(couponBusy ? "checkout.verify" : "checkout.apply")}</button></div>
        <p id="coupon-feedback" className={coupon ? "coupon-success" : "coupon-error"} role="status">{couponMessage}</p>
      </details>
      <input type="hidden" name="couponCode" value={coupon?.code ?? ""} />
      <dl className="checkout-totals"><div><dt>{t("checkoutV2.subtotal")}</dt><dd>{formatMoney(cart.subtotalCents, cart.currency, localeTag)}</dd></div><div><dt>{t("checkout.shipping")}</dt><dd className="checkout-free">{t("checkoutV2.included")}</dd></div>{coupon ? <div className="checkout-discount"><dt>{t("checkout.discount")} · {coupon.code}</dt><dd>−{formatMoney(coupon.discountCents, cart.currency, localeTag)}</dd></div> : null}<div className="checkout-grand-total"><dt>{t("common.total")}<small>{t("checkoutV2.taxIncluded")}</small></dt><dd>{confirmedTotal?.amount ?? formatMoney(totalCents, cart.currency, localeTag)}</dd></div></dl>
      {error ? <p className="checkout-feedback" role="alert">{error}</p> : null}
      {!available.length ? <p className="checkout-feedback" role="status">{t("checkoutV2.unavailable")}</p> : null}
      {hasConfiguredMethods && paymentLoadError && !stripe ? <p className="checkout-feedback" role="alert">{t("checkoutV2.unavailable")}</p> : null}
      <button type="submit" className="checkout-pay-button" disabled={busy || couponBusy || !canPay}><span>{t(busy ? "checkout.processing" : paymentMethod === "bank_transfer" ? "checkoutV2.placeOrder" : "checkoutV2.pay", { amount: confirmedTotal?.amount ?? formatMoney(totalCents, cart.currency, localeTag) })}</span><CheckoutIcon name="arrow" /></button>
      <p className="checkout-button-note">{t("checkoutV2.buttonNote")}</p>
      <div className="checkout-powered"><CheckoutIcon name="lock" /><span>{t("checkoutV2.secureWith")} <strong>stripe</strong></span></div>
    </aside>
  </form>;
}
