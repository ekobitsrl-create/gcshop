export const LEGAL_VERSION = "2026-09-17";
export const legalContent = {
  privacy: {
    title: "Informativa privacy",
    intro: "Come vengono trattati i dati personali durante la navigazione e l'utilizzo del negozio LCS.",
    sections: [
      { title: "Titolare e contatti", text: "Il titolare è Ekobit SRL, P. IVA 02424510796, Via Firenze 185, 88900 Crotone (KR), Italia. Per informazioni sul trattamento dei dati o per esercitare i tuoi diritti: info@ekobit.it, telefono +39 338 134 6675." },
      { title: "Acquisti e assistenza", text: "Trattiamo i dati che inserisci nei moduli: recapiti, indirizzi, articoli acquistati, riferimenti dell'ordine, pagamento e richieste di assistenza o recesso. Servono per gestire le tue richieste, eseguire il contratto e adempiere agli obblighi fiscali e di legge (art. 6.1.b e c GDPR). I campi obbligatori sono necessari per fornire il servizio richiesto. I dati completi della carta vengono raccolti nei campi del gestore di pagamento; il negozio conserva i riferimenti e lo stato delle transazioni." },
      { title: "Private list e newsletter", text: "Solo con il tuo consenso facoltativo (art. 6.1.a GDPR) registriamo email, lingua, data e testo del consenso per inviarti novità e offerte LCS. L'iscrizione non è necessaria per acquistare. Puoi revocare il consenso in qualsiasi momento scrivendo a info@ekobit.it: la revoca non pregiudica la liceità del trattamento precedente. Non vendiamo la lista degli iscritti." },
      { title: "Navigazione e sicurezza", text: "Il sito e i servizi tecnici ricevono dati di connessione, come indirizzo IP, informazioni del browser e richieste al server, per erogare le pagine, diagnosticare errori e proteggere il servizio. La sicurezza si basa sul legittimo interesse del titolare (art. 6.1.f GDPR). Carrello, lingua e confronto utilizzano gli strumenti descritti nell'informativa cookie. Non sono previste decisioni automatizzate con effetti giuridici basate sui dati della newsletter." },
      { title: "Destinatari e servizi", text: "I dati sono accessibili alle persone autorizzate e ai fornitori necessari all'erogazione del servizio, tra cui Vercel per l'hosting, Supabase per database e autenticazione e Stripe per i pagamenti. Per consegna, assistenza e obblighi contabili possono essere comunicati a corrieri, consulenti e autorità nei limiti necessari. Le immagini del catalogo sono caricate anche dal fornitore Romanelli: il browser gli trasmette i dati di connessione necessari alla richiesta dell'immagine." },
      { title: "Trattamenti fuori dallo Spazio economico europeo", text: "L'infrastruttura del database utilizzata dal negozio è negli Stati Uniti; anche i fornitori internazionali possono trattare dati in Paesi extra SEE. Le informazioni sui loro trattamenti e sulle garanzie per i trasferimenti sono disponibili nei collegamenti ai fornitori sotto riportati. Per conoscere le garanzie applicabili ai tuoi dati o richiederne copia puoi contattare il titolare." },
      { title: "Conservazione", text: "I dati degli ordini e della documentazione fiscale sono conservati per i termini previsti dalla legge; quelli di assistenza per il tempo necessario alla gestione della richiesta e alla tutela dei diritti. L'email della private list è conservata fino alla revoca del consenso o alla cessazione dell'iniziativa. Le evidenze eventualmente necessarie per obblighi di legge o controversie sono limitate a tali finalità. Le durate degli strumenti nel browser sono indicate nell'informativa cookie." },
      { title: "I tuoi diritti", text: "Nei casi previsti dagli articoli 15–22 GDPR puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento. Puoi revocare il consenso e proporre reclamo al Garante per la protezione dei dati personali o all'autorità competente. Scrivi a info@ekobit.it; potranno essere richiesti i dati necessari a verificare la tua identità." },
    ],
    links: [
      { label: "Cookie e memorizzazione nel browser", href: "/cookie" },
      { label: "Privacy Stripe", href: "https://stripe.com/privacy" },
      { label: "Privacy Supabase", href: "https://supabase.com/privacy" },
      { label: "Privacy Vercel", href: "https://vercel.com/legal/privacy-notice" },
      { label: "Diritti — Commissione europea", href: "https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en" },
      { label: "Garante per la protezione dei dati personali", href: "https://www.garanteprivacy.it" },
    ],
  },
  cookie: {
    title: "Cookie e strumenti del browser",
    intro: "Informazioni sugli strumenti usati dal negozio per ricordare il carrello, la lingua e il confronto tra prodotti.",
    sections: [
      { title: "Gestore e finalità", text: "Il sito è gestito da Ekobit SRL, Via Firenze 185, 88900 Crotone (KR), info@ekobit.it. I cookie sono piccoli dati memorizzati nel browser. Il negozio usa strumenti funzionali ai servizi richiesti; nel codice del sito non sono integrati pixel pubblicitari o strumenti di profilazione commerciale." },
      { title: "Carrello — lcs_cart", text: "Cookie tecnico di prima parte: contiene un identificativo del carrello, non i dati della carta. Viene creato quando aggiungi prodotti; durata massima 30 giorni. Permette di recuperare il carrello e gestire il percorso d'acquisto." },
      { title: "Lingua — lcs_locale", text: "Cookie di preferenza di prima parte impostato quando cambi lingua. Memorizza la lingua selezionata per un massimo di un anno." },
      { title: "Confronto — lcs.comparison.v1", text: "Memoria locale del browser (localStorage), non un cookie. Conserva i prodotti che scegli di confrontare sul dispositivo. Non ha una scadenza automatica: puoi svuotare il confronto dal sito o cancellare i dati del sito nel browser." },
      { title: "Accesso e pagamento", text: "Le funzioni di accesso possono utilizzare cookie di sessione Supabase. Al checkout i componenti Stripe possono usare identificativi tecnici e strumenti antifrode per gestire in sicurezza il pagamento; nomi e durate dipendono dal servizio e sono descritti nella documentazione Stripe collegata qui sotto." },
      { title: "Gestisci i dati nel browser", text: "Puoi visualizzare e cancellare cookie e dati locali dalle impostazioni privacy del browser. Il blocco degli strumenti necessari può impedire il funzionamento di carrello, accesso o pagamento. Per i soli strumenti tecnici non è richiesto consenso preventivo; eventuali futuri strumenti non necessari dovranno essere gestiti con le scelte di consenso appropriate." },
    ],
    links: [
      { label: "Informativa privacy LCS", href: "/privacy" },
      { label: "Cookie Stripe", href: "https://stripe.com/legal/cookies-policy" },
      { label: "FAQ cookie del Garante", href: "https://www.garanteprivacy.it/faq/cookie" },
    ],
  },
  termini: {
    title: "Condizioni di vendita",
    intro: "Informazioni per gli acquisti online su LCS. Restano fermi i diritti inderogabili riconosciuti al consumatore.",
    sections: [
      { title: "Venditore", text: "Il negozio è gestito da Ekobit SRL, P. IVA 02424510796, con sede in Via Firenze 185, 88900 Crotone (KR), Italia. Contatti: info@ekobit.it, +39 338 134 6675." },
      { title: "Prodotti e disponibilità", text: "La scheda descrive il prodotto, le varianti, il prezzo e la disponibilità. Seleziona la taglia e verifica i dettagli prima di acquistare. Le immagini sono illustrative: la resa del colore può variare con lo schermo. L'inserimento nel carrello non riserva il prodotto; la disponibilità viene verificata durante l'ordine." },
      { title: "Prezzi e ordine", text: "I prezzi sono espressi nella valuta indicata nel negozio. Il riepilogo prima della conferma mostra articoli, quantità, eventuali sconti, imposte e costi di spedizione applicabili, con il totale da pagare. Puoi correggere carrello e dati prima di confermare. Il comando finale di pagamento comporta l'obbligo di pagare l'importo indicato. Conserva il numero d'ordine e il riepilogo per l'assistenza." },
      { title: "Pagamento", text: "I metodi disponibili sono presentati al checkout. Segui le istruzioni del gestore del pagamento e le eventuali verifiche della banca. Un pagamento in attesa non equivale a un pagamento completato. Per il bonifico la preparazione avviene dopo la conferma dell'accredito; consulta la pagina Pagamenti per maggiori informazioni." },
      { title: "Consegna", text: "Destinazione e costi applicabili sono mostrati prima della conferma. Salvo diverso accordo, la consegna avviene entro 30 giorni dalla conclusione del contratto. In caso di ritardo si applicano i rimedi previsti dal Codice del consumo, descritti nella pagina Spedizioni e resi." },
      { title: "Recesso e rimborsi", text: "Il consumatore può comunicare il recesso entro 14 giorni dalla consegna, senza indicarne il motivo, salvo le eccezioni di legge. Può usare il modulo online, il modulo scaricabile o una dichiarazione esplicita a info@ekobit.it. Tempi, costi di restituzione, rimborsi ed eccezioni sono descritti nella pagina Spedizioni e resi, parte delle presenti condizioni." },
      { title: "Garanzia e reclami", text: "Per i beni nuovi si applica la garanzia legale di conformità di due anni dalla consegna. Per assistenza o reclami scrivi a info@ekobit.it indicando il numero d'ordine e il problema. I rimedi di legge non sono limitati da queste condizioni. Si applica la legge italiana, ferme le protezioni inderogabili e le regole di competenza applicabili al consumatore." },
    ],
    links: [
      { label: "Spedizioni, recesso e garanzia", href: "/spedizioni-e-resi" },
      { label: "Metodi di pagamento", href: "/pagamenti" },
      { label: "Informazioni societarie", href: "/informazioni-societarie" },
      { label: "Vendite a distanza — Unione europea", href: "https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm" },
    ],
  },
};
