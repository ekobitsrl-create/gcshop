"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/locale-provider";

export function PayPalComplete({ token, orderNumber }: { token: string; orderNumber: string }) {
  const { t } = useI18n();
  const [message, setMessage] = useState(t("paypal.inProgress"));
  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/payments/paypal/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, orderNumber }) });
      const payload = await response.json();
      if (response.ok) window.location.href = payload.redirectUrl;
      else setMessage(t("paypal.failed"));
    })();
  }, [orderNumber, t, token]);
  return <p>{message}</p>;
}
