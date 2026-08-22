import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Termini e condizioni di vendita",
  description: "Condizioni generali di vendita online di Lusso Concept Store.",
  alternates: { canonical: "/termini-e-condizioni" },
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Condizioni di vendita"
      title="Termini e condizioni"
      intro="Le regole applicabili agli ordini online, ai pagamenti, alla consegna e all’assistenza post-vendita."
    >
      <section>
        <h2>1. Venditore e ambito</h2>
        <p>
          Le presenti condizioni disciplinano la vendita a consumatori tramite Lusso Concept Store. L&apos;identità legale,
          la sede, la partita IVA, l&apos;email e il telefono del venditore sono da completare prima dell&apos;apertura. Il
          catalogo pubblico è attualmente una preview e i prodotti non sono acquistabili finché tali dati e l&apos;attivazione finale del checkout non saranno completati.
        </p>
      </section>

      <section>
        <h2>2. Prodotti, disponibilità e prezzi</h2>
        <p>
          Schede, immagini, colori e misure descrivono il prodotto nel modo più accurato possibile, tenendo conto
          delle differenze tra schermi. Prezzi e disponibilità sono quelli mostrati prima dell&apos;ordine. I prezzi sono
          espressi in euro e includono le imposte applicabili. La spedizione standard in Italia è inclusa, salvo
          diversa indicazione resa chiaramente prima dell&apos;acquisto.
        </p>
      </section>

      <section>
        <h2>3. Ordine e conclusione del contratto</h2>
        <p>
          Prima del pagamento il cliente può controllare e correggere borsa, quantità e dati. L&apos;invio dell&apos;ordine
          costituisce una proposta di acquisto. Il contratto si conclude quando il venditore invia la conferma di
          accettazione dell&apos;ordine e il pagamento è autorizzato. In caso di indisponibilità o errore evidente, il
          cliente viene informato e le somme eventualmente incassate sono restituite senza indebito ritardo.
        </p>
      </section>

      <section>
        <h2>4. Pagamenti</h2>
        <p>
          Il checkout prevede Stripe. I dati completi della carta vengono inseriti nell&apos;ambiente del prestatore di
          pagamento e non sono memorizzati da Lusso Concept Store. Il negozio può sospendere o annullare un ordine
          quando il pagamento non è autorizzato o vi sono ragionevoli indicatori di frode, informando il cliente.
        </p>
      </section>

      <section>
        <h2>5. Consegna</h2>
        <p>
          Salvo diverso accordo, la consegna in Italia avviene entro <strong>7–12 giorni lavorativi</strong> dalla conferma
          dell&apos;ordine e del pagamento. Se il termine non può essere rispettato, il consumatore può assegnare un
          termine supplementare e, nei casi previsti dalla legge, risolvere il contratto. Dettagli e gestione dei
          ritardi sono indicati nella pagina <Link href="/spedizioni-e-resi">Spedizioni e resi</Link>.
        </p>
      </section>

      <section>
        <h2>6. Recesso e restituzioni</h2>
        <p>
          Il consumatore dispone di 14 giorni di calendario dalla consegna per comunicare il recesso senza motivazione,
          salvo le eccezioni di legge. Il bene va rispedito entro i successivi 14 giorni. I costi diretti del reso per
          ripensamento sono a carico del cliente; il venditore rimborsa entro 14 giorni dalla comunicazione, ma può
          attendere il rientro del bene o la prova della spedizione. Condizioni complete, eccezioni e rimborso sono
          descritti in <Link href="/spedizioni-e-resi">Spedizioni e resi</Link>.
        </p>
      </section>

      <section>
        <h2>7. Garanzia legale</h2>
        <p>
          I beni nuovi sono coperti dalla garanzia legale di conformità di 2 anni dalla consegna. In presenza di un
          difetto di conformità il consumatore ha diritto ai rimedi previsti dalla legge, senza spese, rivolgendosi al
          venditore. Eventuali garanzie commerciali aggiuntive non limitano questi diritti.
        </p>
      </section>

      <section>
        <h2>8. Reclami, ADR, legge e foro</h2>
        <p>
          I reclami potranno essere inviati al recapito che sarà pubblicato nei <Link href="/contatti">contatti</Link>.
          Il consumatore può inoltre rivolgersi a un organismo di risoluzione alternativa delle controversie (ADR)
          competente. La precedente piattaforma europea ODR non è più operativa dal 20 luglio 2025. Si applica la
          legge italiana, senza privare il consumatore delle tutele inderogabili del proprio Paese; resta competente
          il foro del luogo di residenza o domicilio del consumatore quando previsto.
        </p>
      </section>

      <section>
        <h2>9. Privacy e modifiche</h2>
        <p>
          I dati personali sono trattati come descritto nell&apos;<Link href="/privacy">informativa privacy</Link>. Le
          condizioni applicabili sono quelle mostrate e accettate al momento dell&apos;ordine; eventuali aggiornamenti
          successivi non modificano i contratti già conclusi.
        </p>
      </section>
    </LegalPage>
  );
}
