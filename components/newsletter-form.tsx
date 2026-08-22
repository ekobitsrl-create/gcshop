"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

export function NewsletterForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return <p className="newsletter-confirmation" role="status">Richiesta registrata nella preview. L&apos;email non è stata salvata.</p>;
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label htmlFor="newsletter-email">Email</label>
      <div>
        <input id="newsletter-email" type="email" name="email" placeholder="La tua email" autoComplete="email" required />
        <button type="submit">Iscriviti <span>↗</span></button>
      </div>
      <small>Il servizio non è ancora attivo. Leggi l&apos;<Link href="/privacy">informativa privacy</Link>.</small>
    </form>
  );
}
