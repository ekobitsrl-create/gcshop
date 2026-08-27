"use client";

import { type FormEvent, useState } from "react";
import { useI18n } from "@/components/locale-provider";

export function NewsletterForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return <p className="newsletter-confirmation" role="status">{t("newsletter.success")}</p>;
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label htmlFor="newsletter-email">Email</label>
      <div>
        <input id="newsletter-email" type="email" name="email" placeholder={t("newsletter.placeholder")} autoComplete="email" required />
        <button type="submit">{t("newsletter.submit")} <span>↗</span></button>
      </div>
      <small>{t("newsletter.privacy")}</small>
    </form>
  );
}
