"use client";

import { useEffect, useState } from "react";

type Method = { code: "card" | "paypal" | "bank_transfer"; name: string; provider: string; enabled: boolean; instructions: string; configured: boolean };

export function AdminPayments() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/payment-methods", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Load failed");
        return response.json();
      })
      .then((payload) => { if (!controller.signal.aborted) setMethods(payload.methods ?? []); })
      .catch(() => { if (!controller.signal.aborted) setMessage("Caricamento non riuscito."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const save = async () => {
    setMessage("");
    const response = await fetch("/api/admin/payment-methods", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ methods }),
    });
    setMessage(response.ok ? "Impostazioni salvate." : "Salvataggio non riuscito.");
    if (response.ok) {
      const refreshed = await fetch("/api/admin/payment-methods", { cache: "no-store" });
      if (refreshed.ok) setMethods((await refreshed.json()).methods ?? []);
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p>Checkout</p><h1>Pagamenti</h1></div><button className="admin-primary-action" type="button" onClick={() => void save()}>Salva modifiche</button></div>
      <section className="admin-payment-grid">
        {loading ? <p>Caricamento…</p> : methods.map((method, index) => (
          <article className="admin-payment-card" key={method.code}>
            <div className="admin-payment-head"><span>0{index + 1}</span><div><p>{method.provider}</p><h2>{method.name}</h2></div><label className="admin-switch"><input type="checkbox" checked={method.enabled} onChange={(e) => setMethods(methods.map((item) => item.code === method.code ? { ...item, enabled: e.target.checked } : item))} /><span /></label></div>
            <label>Istruzioni al cliente<textarea rows={4} value={method.instructions} onChange={(e) => setMethods(methods.map((item) => item.code === method.code ? { ...item, instructions: e.target.value } : item))} /></label>
            <div className={`admin-config-state ${method.configured ? "is-ready" : ""}`}><span />{method.configured ? "Credenziali configurate" : "Credenziali da configurare nell’ambiente protetto"}</div>
            <p className="admin-payment-note">Gestito da Stripe nel checkout del negozio. Richiede STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY e NEXT_PUBLIC_SITE_URL nell’ambiente del sito. Il metodo deve essere attivato anche nel pannello Stripe. La presenza delle credenziali non verifica l’abilitazione dell’account.</p>
          </article>
        ))}
      </section>
      {message && <p className="admin-save-message" role="status">{message}</p>}
    </main>
  );
}
