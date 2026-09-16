"use client";

import { type FormEvent, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { newsletterCopy } from "@/lib/newsletter-copy";

export function NewsletterForm() {
  const { t, locale } = useI18n();
  const copy = newsletterCopy[locale];
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), consent: form.get("consent") === "on", website: form.get("website"), locale }) });
      if (!response.ok) { setError(response.status === 400 ? copy.invalid : copy.error); return; }
      const result = await response.json();
      if (result.subscribed !== true) { setError(copy.error); return; }
      setSent(true);
    } catch { setError(copy.error); }
    finally { setBusy(false); }
  }

  if (sent) {
    return <p className="newsletter-confirmation" role="status">{copy.success}</p>;
  }

  return (
    <form className="newsletter-form" onSubmit={submit} aria-busy={busy}>
      <label htmlFor="newsletter-email">Email</label>
      <div>
        <input id="newsletter-email" type="email" name="email" placeholder={t("newsletter.placeholder")} autoComplete="email" required />
        <button type="submit" disabled={busy}>{busy ? copy.busy : t("newsletter.submit")} <span>↗</span></button>
      </div>
      <label className="newsletter-consent"><input type="checkbox" name="consent" required /> <span>{copy.consent} <a href="/privacy" target="_blank" rel="noopener noreferrer">{copy.privacy}</a></span></label>
      <input type="text" name="website" className="newsletter-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
