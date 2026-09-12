"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { WithdrawalFormContent } from "@/lib/returns-content";

type Confirmation = {
  receiptCode: string;
  receiptText: string;
  submittedAt: string;
  emailSent: boolean;
};

function downloadReceipt(receipt: Confirmation) {
  const blob = new Blob([receipt.receiptText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ricevuta-recesso-${receipt.receiptCode}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function WithdrawalForm({ content, locale }: { content: WithdrawalFormContent; locale: Locale }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/recesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.get("customerName"),
          email: data.get("email"),
          orderNumber: data.get("orderNumber"),
          items: data.get("items"),
          declarationAccepted: data.get("declarationAccepted") === "on",
          website: data.get("website"),
          locale,
        }),
      });
      const payload = await response.json() as Confirmation & { error?: string };
      if (!response.ok) throw new Error(payload.error || content.fallback);
      setConfirmation(payload);
      downloadReceipt(payload);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : content.fallback);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <section className="withdrawal-success" aria-live="polite">
        <span className="withdrawal-success-mark" aria-hidden="true">✓</span>
        <p className="commerce-kicker">{confirmation.receiptCode}</p>
        <h2>{content.successTitle}</h2>
        <p>{content.successCopy}</p>
        {confirmation.emailSent ? <p>{content.successEmail}</p> : null}
        <dl>
          <div><dt>ID</dt><dd>{confirmation.receiptCode}</dd></div>
          <div><dt>UTC</dt><dd>{confirmation.submittedAt}</dd></div>
        </dl>
        <div className="withdrawal-success-actions">
          <button type="button" onClick={() => downloadReceipt(confirmation)}>{content.receipt} <span>↓</span></button>
          <button type="button" onClick={() => setConfirmation(null)}>{content.retry} <span>↗</span></button>
        </div>
      </section>
    );
  }

  return (
    <section className="withdrawal-request" id="richiedi-recesso" aria-labelledby="withdrawal-title">
      <div className="withdrawal-request-intro">
        <p className="commerce-kicker">{content.eyebrow}</p>
        <h2 id="withdrawal-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <form className="withdrawal-form" onSubmit={handleSubmit}>
        <div className="withdrawal-field-row">
          <label htmlFor="withdrawal-name">
            <span>{content.name}</span>
            <input id="withdrawal-name" name="customerName" type="text" autoComplete="name" maxLength={160} placeholder={content.namePlaceholder} required />
          </label>
          <label htmlFor="withdrawal-email">
            <span>{content.email}</span>
            <input id="withdrawal-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder={content.emailPlaceholder} required />
          </label>
        </div>
        <label htmlFor="withdrawal-order">
          <span>{content.orderNumber}</span>
          <input id="withdrawal-order" name="orderNumber" type="text" autoComplete="off" maxLength={80} placeholder={content.orderPlaceholder} required />
        </label>
        <label htmlFor="withdrawal-items">
          <span>{content.items}</span>
          <textarea id="withdrawal-items" name="items" rows={4} maxLength={1200} placeholder={content.itemsPlaceholder} aria-describedby="withdrawal-items-hint" />
          <small id="withdrawal-items-hint">{content.itemsHint}</small>
        </label>
        <label className="withdrawal-honeypot" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <label className="withdrawal-declaration" htmlFor="withdrawal-declaration">
          <input id="withdrawal-declaration" name="declarationAccepted" type="checkbox" required />
          <span>{content.declaration}</span>
        </label>
        <p className="withdrawal-privacy">{content.privacy}</p>
        {error ? <p className="withdrawal-error" role="alert">{error} <a href="mailto:info@ekobit.it">info@ekobit.it</a></p> : null}
        <button className="withdrawal-submit" type="submit" disabled={submitting}>
          <span>{submitting ? content.submitting : content.submit}</span><b aria-hidden="true">→</b>
        </button>
      </form>
    </section>
  );
}
