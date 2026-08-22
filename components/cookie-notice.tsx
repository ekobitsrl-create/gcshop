"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const storageKey = "lusso_cookie_notice_v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setVisible(window.localStorage.getItem(storageKey) !== "acknowledged");
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function acknowledge() {
    try {
      window.localStorage.setItem(storageKey, "acknowledged");
    } catch {
      // La chiusura resta valida per la sessione anche se lo storage è bloccato.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="cookie-notice" aria-labelledby="cookie-notice-title">
      <div>
        <strong id="cookie-notice-title">Cookie necessari</strong>
        <p>
          Usiamo solo strumenti tecnici necessari al carrello, alla sicurezza e alle sessioni.
          Non sono attivi cookie pubblicitari o di profilazione.
        </p>
      </div>
      <div className="cookie-notice-actions">
        <Link href="/cookie-policy">Cookie policy</Link>
        <button type="button" onClick={acknowledge}>Ho capito</button>
      </div>
    </aside>
  );
}
