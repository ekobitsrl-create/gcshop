import LoginForm from "./login-form";
import "./login.css";

export const metadata = {
  title: "Accesso amministrazione | Luxury Concept Store",
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
        <a className="login-brand" href="/" aria-label="Luxury Concept Store">
          <span>LC</span>
          <strong>Luxury Concept Store</strong>
        </a>
        <p className="login-kicker">Area riservata Ekobit SRL</p>
        <h1>Accedi al pannello amministrativo.</h1>
        <p className="login-copy">
          Inserisci l’indirizzo autorizzato. Riceverai un collegamento sicuro e senza password.
        </p>
        {params.errore ? <p className="login-error">Il collegamento non è valido o è scaduto.</p> : null}
        <LoginForm returnTo={returnTo} />
        <a className="login-back" href="/">← Torna al negozio</a>
      </section>
    </main>
  );
}
