"use client";

import { useCallback, useEffect, useState } from "react";

type Method = { code: "stripe" | "paypal" | "bank_transfer"; name: string; provider: string; enabled: boolean; instructions: string; configured: boolean };

export function AdminPayments() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/payment-methods", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setMethods(payload.methods ?? []);
    setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    void fetch("/api/admin/payment-methods", { cache: "no-store" })
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!active) return;
        if (ok) setMethods(payload.methods ?? []);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const save = async () => {
    setMessage("");
    const response = await fetch("/api/admin/payment-methods", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ methods }),
    });
    setMessage(response.ok ? "Impostazioni salvate." : "Salvataggio non riuscito.");
    if (response.ok) await load();
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
            <p className="admin-payment-note">{method.code === "stripe" ? "Richiede STRIPE_SECRET_KEY e, per la conferma automatica, STRIPE_WEBHOOK_SECRET. Le chiavi non vengono mai salvate nel database." : method.code === "paypal" ? "Richiede PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET. Le chiavi non vengono mai salvate nel database." : "Richiede intestatario, IBAN e facoltativamente BIC. I dati bancari non vengono inclusi nel codice pubblico."}</p>
          </article>
        ))}
      </section>
      {message && <p className="admin-save-message" role="status">{message}</p>}
    </main>
  );
}
