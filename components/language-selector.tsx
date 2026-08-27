"use client";

import { useState } from "react";
import { localeLabels, locales, type Locale } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";

export function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const { locale, t } = useI18n();
  const [busy, setBusy] = useState(false);

  async function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    setBusy(true);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (response.ok) window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className={`language-selector${mobile ? " language-selector-mobile" : ""}`}>
      <span>{t("common.language")}</span>
      <select
        aria-label={t("common.language")}
        disabled={busy}
        value={locale}
        onChange={(event) => void changeLocale(event.target.value as Locale)}
      >
        {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
      </select>
    </label>
  );
}
