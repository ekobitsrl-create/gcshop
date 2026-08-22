import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Informazioni sui cookie tecnici usati da Lusso Concept Store.",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      kicker="Cookie"
      title="Cookie policy"
      intro="Una spiegazione chiara degli strumenti tecnici usati dal sito e delle loro finalità."
    >
      <section>
        <h2>1. Cosa usa questa preview</h2>
        <p>
          Al momento il sito non attiva cookie analytics, pubblicitari o di profilazione. Utilizza soltanto strumenti
          necessari a fornire le funzioni richieste, proteggere il servizio e ricordare la chiusura dell&apos;avviso cookie.
          Per questi strumenti tecnici non è richiesto il consenso, ma resta dovuta questa informativa.
        </p>
      </section>

      <section>
        <h2>2. Strumenti tecnici</h2>
        <div className="legal-table cookie-table" role="table" aria-label="Elenco degli strumenti tecnici">
          <div role="row"><strong role="cell">lcs_cart</strong><span role="cell">Cookie di prima parte, HTTP-only, durata massima 30 giorni. Collega il browser alla borsa e non contiene i dati della carta.</span></div>
          <div role="row"><strong role="cell">lusso_preview_bag_v1</strong><span role="cell">Voce nel local storage che conserva sul dispositivo i prodotti aggiunti alla borsa di anteprima. Non contiene dati anagrafici o di pagamento.</span></div>
          <div role="row"><strong role="cell">Sessione area riservata</strong><span role="cell">Cookie tecnici usati solo dagli amministratori autenticati per mantenere la sessione e proteggere l&apos;area riservata.</span></div>
          <div role="row"><strong role="cell">lusso_cookie_notice_v1</strong><span role="cell">Voce nel local storage del browser, senza scadenza automatica, che ricorda la chiusura dell&apos;avviso informativo.</span></div>
        </div>
      </section>

      <section>
        <h2>3. Pagamento esterno</h2>
        <p>
          Quando il checkout sarà attivo, scegliendo Stripe verrai trasferito a una pagina ospitata da Stripe.
          In quel contesto Stripe può usare propri cookie e tratta i dati secondo la propria informativa. Lusso Concept
          Store riceve soltanto gli identificativi e l&apos;esito necessari a riconciliare il pagamento con l&apos;ordine.
        </p>
      </section>

      <section>
        <h2>4. Gestione dal browser</h2>
        <p>
          Puoi eliminare cookie e local storage dalle impostazioni del browser. Se blocchi gli strumenti tecnici,
          la borsa, il login amministrativo o il checkout potrebbero non funzionare. L&apos;avviso mostrato dal sito è
          informativo: il pulsante “Ho capito” non esprime un consenso a finalità pubblicitarie.
        </p>
      </section>

      <section>
        <h2>5. Nuovi servizi</h2>
        <p>
          Prima di attivare strumenti non necessari, questa pagina sarà aggiornata e, quando richiesto, tali strumenti
          resteranno disabilitati fino a una scelta libera dell&apos;utente. Per maggiori dettagli sul trattamento consulta
          l&apos;<Link href="/privacy">informativa privacy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
