"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/locale-provider";
import { StripeResumePayment } from "@/components/stripe-resume-payment";
import type { BankInstructions, CheckoutLaunch } from "@/lib/stripe-checkout";
import { formatMoney } from "@/lib/store-utils";

export function StripeOrderStatus({ orderNumber, status, canResume, bankInstructions }: { orderNumber: string; status: string; canResume: boolean; bankInstructions?: BankInstructions | null }) {
  const { t, localeTag } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [launch, setLaunch] = useState<Extract<CheckoutLaunch, { type: "custom" }> | null>(null);
  useEffect(() => {
    if (status !== "pending") return;
    let refreshes = 0;
    const timer = setInterval(() => {
      router.refresh();
      if (++refreshes >= 12) clearInterval(timer);
    }, 5000);
    return () => clearInterval(timer);
  }, [router, status]);

  async function resume() {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch("/api/payments/stripe/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber }) });
      const data = await response.json();
      if (!response.ok) throw new Error();
      if (data.type === "custom") { setLaunch(data); setBusy(false); }
      else if (typeof data.redirectUrl === "string") window.location.assign(data.redirectUrl);
      else throw new Error();
    } catch { setError(true); setBusy(false); }
  }

  return <section className="bank-details" aria-live="polite">
    <strong>{t(`stripe.${status === "paid" ? "paid" : status === "pending" ? "pending" : status === "refunded" ? "refunded" : "closed"}`)}</strong>
    {status === "pending" ? <p>{t("stripe.pendingCopy")}</p> : null}
    {status === "pending" && canResume && bankInstructions ? <div className="stripe-bank-instructions">
      <h3>{t("order.bankTitle")}</h3><p>{t("checkoutV2.bankDue")}: <strong>{formatMoney(bankInstructions.amountRemaining, bankInstructions.currency, localeTag)}</strong></p>
      {bankInstructions.accounts.map((account) => <dl key={account.iban}><dt>{t("order.accountHolder")}</dt><dd>{account.accountHolder}</dd><dt>IBAN</dt><dd style={{ overflowWrap: "anywhere" }}>{account.iban}</dd><dt>BIC</dt><dd>{account.bic}</dd></dl>)}
      <p>{t("order.reference")}: <strong>{bankInstructions.reference}</strong></p>
    </div> : null}
    {status === "pending" && canResume && !bankInstructions ? launch ? <StripeResumePayment launch={launch} /> : <button type="button" className="checkout-submit" disabled={busy} onClick={() => void resume()}>{t(busy ? "checkout.processing" : "stripe.resume")}</button> : null}
    {status === "failed" ? <Link href="/checkout">{t("stripe.backToCart")}</Link> : null}
    {error ? <p role="alert">{t("checkout.unavailable")}</p> : null}
  </section>;
}
