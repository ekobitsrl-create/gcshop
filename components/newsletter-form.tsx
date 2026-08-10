"use client";

import { type FormEvent, useState } from "react";

export function NewsletterForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return <p className="newsletter-confirmation" role="status">Sei dentro. Ti scriveremo solo quando ne vale la pena.</p>;
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label htmlFor="newsletter-email">Email</label>
      <div>
        <input id="newsletter-email" type="email" name="email" placeholder="La tua email" autoComplete="email" required />
        <button type="submit">Iscriviti <span>↗</span></button>
      </div>
      <small>Iscrivendoti accetti la nostra informativa privacy.</small>
    </form>
  );
}
