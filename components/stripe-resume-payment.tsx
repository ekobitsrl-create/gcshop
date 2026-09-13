"use client";

import { useRef, useState } from "react";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { getBrowserStripe } from "@/lib/stripe-browser";
import { useI18n } from "@/components/locale-provider";
import type { CheckoutLaunch } from "@/lib/stripe-checkout";

export function StripeResumePayment({ launch }: { launch: Extract<CheckoutLaunch, { type: "custom" }> }) {
  const { locale } = useI18n();
  return <CheckoutElementsProvider stripe={getBrowserStripe(locale)} options={{ clientSecret: launch.clientSecret, elementsOptions: { appearance: { theme: "stripe", variables: { colorPrimary: "#324954", borderRadius: "4px" } } } }}>
    <ResumeForm orderUrl={launch.orderUrl} />
  </CheckoutElementsProvider>;
}

function ResumeForm({ orderUrl }: { orderUrl: string }) {
  const result = useCheckoutElements();
  const { t } = useI18n();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (result.type === "loading") return <p role="status">{t("checkoutV2.loadingFields")}</p>;
  if (result.type === "error") return <p role="alert">{t("checkout.unavailable")}</p>;
  const { checkout } = result;
  return <form className="stripe-resume-form" onSubmit={async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const confirmed = await checkout.confirm({ redirect: "if_required" });
      if (confirmed.type === "error") throw new Error(confirmed.error.message);
      window.location.assign(orderUrl);
    } catch (failure) { setError(failure instanceof Error ? failure.message : t("checkout.failed")); inFlight.current = false; setBusy(false); }
  }}>
    <PaymentElement options={{ layout: "accordion" }} />
    <p>{t("common.total")}: <strong>{checkout.total.total.amount}</strong></p>
    {error ? <p role="alert">{error}</p> : null}
    <button type="submit" className="checkout-submit" disabled={busy}>{t(busy ? "checkout.processing" : "checkoutV2.confirmPayment")}</button>
  </form>;
}
