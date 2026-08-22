"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, returnTo }),
      });
      const payload = (await response.json()) as { error?: string };
      setMessage(response.ok ? "Link inviato. Controlla la casella email." : payload.error ?? "Accesso non disponibile.");
    } catch {
      setMessage("Connessione non disponibile. Riprova tra poco.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="admin-email">Email amministratore</label>
      <input
        id="admin-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "Invio in corso…" : "Invia link di accesso"}
      </button>
      {message ? <p className="login-message" role="status">{message}</p> : null}
    </form>
  );
}
