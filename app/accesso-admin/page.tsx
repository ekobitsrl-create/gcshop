import LoginForm from "./login-form";
import Link from "next/link";
import "./login.css";

export const metadata = {
  title: "Accesso amministrazione | Lusso Concept Store",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; errore?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to?.startsWith("/admin") && !params.return_to.startsWith("//")
    ? params.return_to
    : "/admin";

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="login-brand" href="/" aria-label="Lusso Concept Store">
          <span>LS</span>
          <strong>Lusso</strong>
        </Link>
        <p className="login-kicker">Area riservata Ekobit SRL</p>
        <h1>Accedi al pannello amministrativo.</h1>
        <p className="login-copy">
          Inserisci l’indirizzo autorizzato. Riceverai un collegamento sicuro e senza password.
        </p>
        {params.errore ? <p className="login-error">Il collegamento non è valido o è scaduto.</p> : null}
        <LoginForm returnTo={returnTo} />
        <Link className="login-back" href="/">← Torna al negozio</Link>
      </section>
    </main>
  );
}
