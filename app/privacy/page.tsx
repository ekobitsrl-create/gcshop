import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Informativa privacy",
  description: "Informativa sul trattamento dei dati personali di Lusso Concept Store.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy"
      title="Informativa privacy"
      intro="Come vengono trattati i dati personali quando visiti il sito, usi il carrello o effettui un ordine."
    >
      <section>
        <h2>1. Titolare del trattamento</h2>
        <p>
          Il titolare del trattamento sarà il soggetto che gestirà Lusso Concept Store. Ragione sociale,
          sede, partita IVA, indirizzo email e un recapito dedicato alla privacy sono <strong>da completare
          prima dell&apos;apertura delle vendite</strong>. Fino ad allora il sito è una preview e non accetta ordini.
        </p>
      </section>

      <section>
        <h2>2. Dati trattati</h2>
        <ul>
          <li>dati di navigazione e log tecnici, come indirizzo IP, data, ora, URL richiesto e informazioni sul dispositivo;</li>
          <li>identificativo tecnico del carrello e prodotti inseriti;</li>
          <li>nome, cognome, email, telefono, indirizzo di consegna, note e dati dell&apos;ordine quando il checkout sarà attivo;</li>
          <li>identificativi e stato del pagamento comunicati da Stripe; i dati completi della carta sono inseriti sulla pagina sicura di Stripe e non vengono memorizzati dal negozio;</li>
          <li>dati e credenziali di sessione degli utenti autorizzati dell&apos;area amministrativa.</li>
        </ul>
        <p>
          Il modulo newsletter presente nella preview mostra soltanto una conferma locale: al momento non
          invia né salva l&apos;indirizzo email. Prima della sua attivazione saranno indicati finalità, base giuridica e modalità di revoca.
        </p>
      </section>

      <section>
        <h2>3. Finalità e basi giuridiche</h2>
        <div className="legal-table" role="table" aria-label="Finalità del trattamento">
          <div role="row"><strong role="cell">Navigazione e sicurezza</strong><span role="cell">Erogazione del servizio, sicurezza e prevenzione degli abusi; legittimo interesse e necessità tecnica.</span></div>
          <div role="row"><strong role="cell">Carrello e checkout</strong><span role="cell">Gestione delle richieste precontrattuali e del contratto di vendita.</span></div>
          <div role="row"><strong role="cell">Ordini e fatturazione</strong><span role="cell">Esecuzione del contratto e adempimento di obblighi fiscali, contabili e di legge.</span></div>
          <div role="row"><strong role="cell">Assistenza e controversie</strong><span role="cell">Riscontro alle richieste, tutela dei diritti e legittimo interesse alla difesa.</span></div>
          <div role="row"><strong role="cell">Marketing futuro</strong><span role="cell">Solo con consenso, revocabile in qualsiasi momento senza conseguenze sugli acquisti.</span></div>
        </div>
      </section>

      <section>
        <h2>4. Conferimento e conservazione</h2>
        <p>
          I dati contrassegnati come obbligatori sono necessari per concludere ed eseguire l&apos;ordine; senza di essi
          non è possibile procedere. I dati sono conservati per il tempo necessario alla finalità e, per ordini,
          pagamenti e documentazione fiscale, per i periodi richiesti dalla normativa applicabile. Log di sicurezza
          e richieste di assistenza sono conservati per periodi proporzionati alla tutela del servizio e dei diritti.
        </p>
      </section>

      <section>
        <h2>5. Destinatari e trasferimenti</h2>
        <p>
          I dati possono essere trattati da fornitori di hosting e infrastruttura, Stripe per i pagamenti, corrieri,
          consulenti contabili o legali e autorità quando previsto dalla legge. Tali soggetti operano come autonomi
          titolari o responsabili del trattamento secondo il ruolo svolto. Eventuali trasferimenti fuori dallo Spazio
          economico europeo avverranno sulla base degli strumenti e delle garanzie previsti dal GDPR.
        </p>
      </section>

      <section>
        <h2>6. Diritti</h2>
        <p>
          Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opposizione nei casi previsti,
          nonché revocare il consenso senza pregiudicare i trattamenti già effettuati. Puoi inoltre proporre reclamo
          al Garante per la protezione dei dati personali. Il recapito per esercitare i diritti sarà pubblicato nei
          <Link href="/contatti"> contatti</Link> prima del lancio.
        </p>
      </section>

      <section>
        <h2>7. Cookie, minori e aggiornamenti</h2>
        <p>
          Per gli strumenti salvati sul dispositivo consulta la <Link href="/cookie-policy">Cookie policy</Link>.
          Il negozio non è destinato a minori di 18 anni e non raccoglie consapevolmente dati di minori. Questa
          informativa potrà essere aggiornata quando saranno definiti il titolare, i fornitori e i servizi effettivamente attivati.
        </p>
      </section>
    </LegalPage>
  );
}
