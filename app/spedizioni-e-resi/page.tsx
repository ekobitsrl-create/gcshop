import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import "../commerce.css";

export const metadata: Metadata = {
  title: "Spedizioni e resi",
  description: "Tempi, modalità di spedizione, resi e diritto di recesso di Lusso Concept Store.",
  alternates: { canonical: "/spedizioni-e-resi" },
};

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      kicker="Assistenza"
      title="Spedizioni e resi"
      intro="Spedizione standard gratuita in Italia e consegna stimata in 7–12 giorni lavorativi."
    >
      <section>
        <h2>1. Dove e quando consegniamo</h2>
        <p>
          La spedizione standard è gratuita sul territorio italiano. Salvo un diverso termine indicato prima
          dell&apos;ordine, la consegna è prevista entro <strong>7–12 giorni lavorativi</strong> dalla conferma dell&apos;ordine
          e del pagamento. Per giorni lavorativi si intendono dal lunedì al venerdì, esclusi i festivi nazionali.
          I tempi sono stimati e possono variare per località difficilmente raggiungibili o cause non controllabili.
        </p>
      </section>

      <section>
        <h2>2. Preparazione, tracking e indirizzo</h2>
        <p>
          Quando disponibile, il codice di tracciamento viene inviato all&apos;email usata per l&apos;ordine. Il cliente
          deve verificare che indirizzo, CAP, nominativo e telefono siano corretti. Per correggere un errore occorre
          contattare l&apos;assistenza prima dell&apos;affidamento al corriere; dopo quel momento la modifica potrebbe non essere possibile.
        </p>
      </section>

      <section>
        <h2>3. Ritardi, mancata consegna e danni</h2>
        <p>
          In caso di ritardo significativo informeremo il cliente e concorderemo un termine supplementare, fatti
          salvi i casi in cui la data concordata sia essenziale. Il rischio di perdita o danneggiamento resta a carico
          del venditore fino alla consegna, salvo che il consumatore scelga autonomamente un vettore non proposto dal negozio.
          Se il pacco è visibilmente danneggiato, è utile documentarlo e segnalarlo subito al corriere e all&apos;assistenza.
        </p>
      </section>

      <section>
        <h2>4. Diritto di recesso</h2>
        <p>
          Il consumatore può comunicare il recesso, senza indicarne il motivo, entro <strong>14 giorni di calendario</strong>
          dal giorno in cui riceve il prodotto. Dopo la comunicazione deve restituire il bene senza indebito ritardo
          e comunque entro 14 giorni. Il recapito e l&apos;indirizzo per il reso saranno pubblicati nei <Link href="/contatti">contatti</Link>
          prima dell&apos;apertura delle vendite; fino ad allora non è possibile perfezionare acquisti.
        </p>
      </section>

      <section>
        <h2>5. Costi e condizioni del reso</h2>
        <p>
          Per il semplice ripensamento, i costi diretti della restituzione sono a carico del cliente. Il bene può
          essere esaminato come in negozio; il consumatore risponde soltanto della diminuzione di valore derivante
          da una manipolazione ulteriore a quella necessaria a verificarne natura, caratteristiche e funzionamento.
          Se il prodotto è errato, danneggiato o non conforme, le spese necessarie al rimedio sono a carico del venditore.
        </p>
      </section>

      <section>
        <h2>6. Rimborso</h2>
        <p>
          In caso di recesso saranno rimborsati i pagamenti ricevuti, inclusi gli eventuali costi della consegna
          standard, entro 14 giorni dalla comunicazione. Il rimborso può essere trattenuto fino al ricevimento dei
          beni o della prova di spedizione, se anteriore. Verrà usato lo stesso mezzo di pagamento, salvo diverso
          accordo, senza costi aggiuntivi per il consumatore.
        </p>
      </section>

      <section>
        <h2>7. Eccezioni e garanzia</h2>
        <p>
          Il recesso non si applica nei casi previsti dalla legge, tra cui beni confezionati su misura o chiaramente
          personalizzati e beni sigillati non restituibili per ragioni igieniche o di tutela della salute se aperti.
          Resta sempre distinta la <strong>garanzia legale di conformità di 2 anni</strong> sui beni nuovi. Consulta anche
          i <Link href="/termini-e-condizioni">Termini e condizioni</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
