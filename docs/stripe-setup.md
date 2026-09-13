# Collegare Stripe al sito Node.js

L’integrazione usa Next.js su Node.js, Stripe Elements e Checkout Sessions con `ui_mode: custom`. Il cliente sceglie carta, PayPal o bonifico nella pagina del negozio e conferma con **Paga** o **Conferma ordine**. Stripe gestisce il pagamento e le eventuali autorizzazioni. Non occorrono WordPress, WooCommerce o chiavi PayPal per i nuovi ordini.

## Configurazione dell’account

1. Verificare in Stripe che la società sia quella del negozio e che pagamenti e bonifici in uscita siano abilitati. Aggiornare il sito web e i recapiti dell’attività, se ancora riferiti al vecchio negozio.
2. In **Impostazioni → Metodi di pagamento**, verificare **Carte**, **PayPal** e **Bonifico bancario EUR**. Per PayPal completare il collegamento dell’account e scegliere il saldo Stripe come destinazione degli incassi se si desidera centralizzarli. L’abilitazione effettiva dipende dall’account.
3. Il bonifico usa `customer_balance` con `eu_bank_transfer`, non l’addebito diretto `sepa_debit`. Le coordinate vengono generate da Stripe; `DE` indica il paese delle coordinate virtuali EUR, non la sede della società italiana.

## Variabili dell’ambiente Node.js

Configurare sul provider che ospita il sito (e in `.env.local` per le prove):

| Variabile | Valore |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Facoltativo: URL canonico HTTPS, senza percorso. Se assente si usa `https://www.luxconceptstore.com`, già definito in `lib/site-url.mjs` |
| `STRIPE_SECRET_KEY` | Chiave segreta dell’account Stripe, inizialmente di test |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chiave pubblicabile `pk_test_...` dello stesso account e ambiente della chiave segreta |
| `STRIPE_WEBHOOK_SECRET` | Segreto di firma dell’endpoint, con prefisso `whsec_` |

Restano necessarie le variabili database e autenticazione già elencate in `.env.example`. La chiave pubblicabile carica i campi protetti sul browser; la chiave segreta rimane esclusivamente sul server. La conferma usa `redirect: if_required`: le carte restano nel negozio, salvo autenticazione richiesta, mentre PayPal può aprire il proprio flusso di autorizzazione.

Non mettere chiavi segrete nel repository o nelle variabili `NEXT_PUBLIC_`. Usare un database isolato e chiavi Stripe di test per le prove. Nel pannello amministrativo **Pagamenti**, il controllo configurazione elenca le variabili mancanti, i formati errati e l’eventuale abbinamento di una chiave test con una live, senza mostrare i segreti. La configurazione valida abilita il pulsante di pagamento nel negozio, ma non certifica che Stripe abbia approvato i metodi richiesti. Dopo aver modificato le variabili Vercel, eseguire un nuovo deployment: la chiave pubblicabile viene inclusa nella build del browser.

## Endpoint delle notifiche

In Stripe Workbench/Webhook, creare una destinazione per **gli eventi del proprio account**:

`https://DOMINIO-DEL-NEGOZIO/api/payments/stripe/webhook`

Selezionare:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.canceled`
- `charge.refunded`

Copiare il segreto di firma nella variabile `STRIPE_WEBHOOK_SECRET` e ridistribuire il sito. Test e produzione hanno chiavi ed endpoint distinti. Non riutilizzare il segreto del vecchio endpoint WooCommerce.

Per le prove locali con Stripe CLI autenticata:

```sh
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

Usare il segreto stampato dalla CLI nell’ambiente locale. Completare il checkout di un ordine creato dal sito: eventi sintetici senza il suo `orderId` non verificano l’intero flusso.

## Gestione degli ordini

- Il checkout raccoglie contatti e indirizzo e mostra selettore del metodo, campi della carta, prodotti e totale nella stessa pagina. I numeri della carta sono raccolti da Stripe Elements e non transitano attraverso l’API del negozio. Il server autorizza solo i metodi abilitati nel gestionale. La conferma aggiorna il metodo effettivo a `card`, `paypal` o `bank_transfer`.
- Prima dell’addebito viene mostrato il totale effettivo di Stripe. Se è cambiato rispetto al riepilogo, il cliente deve confermarlo nuovamente. Dopo la prenotazione dell’ordine i dati e lo sconto rimangono fissi; un tentativo con dati differenti rimanda all’ordine già registrato. La ripresa del pagamento avviene nella pagina ordine con Elements.
- Il bonifico mostra IBAN, BIC, intestatario, causale e importo residuo nella pagina ordine al proprietario del carrello. Il pagamento resta in attesa fino all’accredito. Le sessioni ospitate create in precedenza conservano il loro percorso originale.
- Il totale è calcolato dal server sui prezzi attuali, inclusi gli sconti; spedizione inclusa. Il riepilogo dettagliato resta nel negozio, mentre Stripe mostra un’unica voce con il totale dell’ordine.
- La creazione dell’ordine riserva disponibilità e utilizzo del coupon in una transazione. Tentativi ripetuti sullo stesso carrello riusano lo stesso ordine e la stessa richiesta Stripe.
- Le sessioni Checkout aperte scadono dopo un’ora. L’evento di scadenza restituisce disponibilità e coupon una sola volta. Anche i pagamenti falliti o annullati tramite Stripe rilasciano le prenotazioni.
- Uscire dalla pagina di pagamento mantiene la prenotazione fino alla scadenza e permette di riprendere il pagamento dalla pagina ordine o da `/checkout`.
- Il bonifico confermato in Checkout può restare in attesa di accredito oltre la scadenza della sessione: la merce resta riservata. Non scade automaticamente dopo un’ora se Stripe ha già completato Checkout e mostrato le istruzioni di bonifico. Gestire eventuali annullamenti dal pannello Stripe e verificare la ricezione dell’evento di annullamento; non cambiare manualmente lo stato del solo database.
- Solo l’effettivo stato Stripe `paid` porta l’ordine in lavorazione. Una notifica ripetuta non duplica l’ordine né scarica nuovamente il magazzino.
- I rimborsi completi aggiornano il pagamento a `refunded`; quelli parziali vengono registrati nella transazione. Un rimborso non rimette automaticamente a magazzino un articolo spedito.
- Se una connessione si interrompe durante la creazione, riprendere il pagamento: viene riutilizzata la chiave di idempotenza. Dopo 30 minuti la ripresa cerca una sessione eventualmente creata ma non salvata; se non esiste, libera la prenotazione. Le interruzioni avvenute prima che Stripe crei una sessione richiedono questa ripresa, poiché non producono un evento di scadenza Stripe.
- Le vecchie route PayPal e le coordinate manuali restano per gli ordini storici. I nuovi ordini non le usano.

## Verifiche prima degli incassi reali

```sh
npm test
npm run build
```

La suite pagamenti esegue le migrazioni esistenti su PostgreSQL locale in memoria (PGlite). Verifica duplicati, rollback, disponibilità, sconti, incassi differiti, scadenze, rimborsi, firma webhook, sessioni custom, variazioni di prezzo e ripresa dopo errori. Le API Stripe e le conferme browser sono simulate in questi test.

Sul proprio account di test verificare inoltre: carta riuscita e rifiutata, carta con 3D Secure completato e annullato, PayPal riuscito, ritorno senza pagare, bonifico insufficiente e completo, sessione scaduta, reinvio di una notifica e rimborso. Controllare importo, valuta e ordine sia nel negozio sia su Stripe.

Non sono richieste nuove migrazioni per questa integrazione. I dati Stripe sono nelle transazioni esistenti con tipo `stripe_checkout`.

La configurazione `.openai/hosting.json` presente nel repository è precedente: questa integrazione conserva il runtime Node.js e il database PostgreSQL TCP dell’applicazione. Non distribuirla su un runtime Sites che non supporta la connessione database attuale.

Riferimenti: [PayPal](https://docs.stripe.com/payments/paypal/activate), [bonifico](https://docs.stripe.com/payments/bank-transfers), [webhook](https://docs.stripe.com/webhooks).
