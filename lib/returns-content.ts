import type { Locale } from "@/lib/i18n";

export type WithdrawalFormContent = {
  eyebrow: string;
  title: string;
  description: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  orderNumber: string;
  orderPlaceholder: string;
  items: string;
  itemsPlaceholder: string;
  itemsHint: string;
  declaration: string;
  submit: string;
  submitting: string;
  privacy: string;
  successTitle: string;
  successCopy: string;
  successEmail: string;
  receipt: string;
  retry: string;
  fallback: string;
};

type PolicySection = {
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ReturnsContent = {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroEmphasis: string;
  heroCopy: string;
  legalLabel: string;
  summaryTitle: string;
  summary: Array<{ value: string; label: string }>;
  navLabel: string;
  nav: Array<{ href: string; label: string }>;
  sections: PolicySection[];
  addressLabel: string;
  returnAddress: string;
  modelTitle: string;
  modelCopy: string;
  downloadModel: string;
  emailAlternative: string;
  sourcesTitle: string;
  sourcesCopy: string;
  updated: string;
  form: WithdrawalFormContent;
};

const it: ReturnsContent = {
  metaTitle: "Spedizioni e resi",
  metaDescription: "Informazioni su consegna, diritto di recesso, restituzioni, rimborsi e garanzia legale per gli acquisti LCS.",
  heroTitle: "Spedizioni",
  heroEmphasis: "e resi.",
  heroCopy: "Tempi chiari, passaggi semplici e i tuoi diritti sempre accessibili, prima e dopo l’acquisto.",
  legalLabel: "LCS / Assistenza",
  summaryTitle: "In breve",
  summary: [
    { value: "14 giorni", label: "per comunicare il recesso dalla consegna" },
    { value: "14 giorni", label: "per restituire dopo la comunicazione" },
    { value: "Stesso metodo", label: "utilizzato per il pagamento" },
    { value: "Nessun motivo", label: "è necessario per recedere" },
  ],
  navLabel: "In questa pagina",
  nav: [
    { href: "#spedizione", label: "Spedizione" },
    { href: "#recesso", label: "Diritto di recesso" },
    { href: "#restituzione", label: "Restituzione" },
    { href: "#rimborso", label: "Rimborso" },
    { href: "#eccezioni", label: "Eccezioni" },
    { href: "#garanzia", label: "Prodotti non conformi" },
    { href: "#richiedi-recesso", label: "Recedere online" },
  ],
  sections: [
    {
      number: "01",
      title: "Spedizione e consegna",
      paragraphs: [
        "Le modalità, gli eventuali costi e la destinazione della consegna vengono indicati prima della conferma dell’ordine. Salvo un diverso termine concordato, la consegna avviene senza indebito ritardo e comunque entro 30 giorni dalla conclusione del contratto.",
        "Se la consegna non avviene nel termine pattuito, il consumatore può invitare il venditore a effettuare la consegna entro un termine supplementare adeguato e, nei casi previsti dalla legge, risolvere il contratto.",
      ],
    },
    {
      number: "02",
      title: "Diritto di recesso",
      paragraphs: [
        "Il consumatore può recedere dall’acquisto online senza indicarne il motivo entro 14 giorni dal giorno in cui lui, o un terzo designato diverso dal vettore, acquisisce il possesso fisico dei beni.",
        "Per più beni ordinati insieme ma consegnati separatamente, il termine decorre dalla consegna dell’ultimo bene. È sufficiente inviare la comunicazione di recesso prima della scadenza.",
      ],
    },
    {
      number: "03",
      title: "Come esercitarlo",
      paragraphs: [
        "Puoi utilizzare la funzione “Conferma recesso” disponibile in questa pagina oppure inviare, entro il termine, una dichiarazione esplicita a info@ekobit.it. Indica nome, numero d’ordine e un recapito elettronico per la conferma.",
        "La funzione online rilascia una ricevuta conservabile con il contenuto della dichiarazione, la data e l’ora della trasmissione. Puoi anche usare il modulo tipo scaricabile qui sotto, ma non è obbligatorio.",
      ],
    },
    {
      number: "04",
      title: "Restituzione dei beni",
      paragraphs: [
        "Dopo aver comunicato il recesso, restituisci i beni senza indebito ritardo e comunque entro 14 giorni. Il termine è rispettato se affidi la spedizione al vettore prima della scadenza.",
        "I costi diretti della restituzione sono a carico del consumatore. Conserva la prova di spedizione fino alla conclusione del rimborso. Per beni difettosi, danneggiati o diversi da quelli ordinati, i costi necessari alla restituzione restano a carico del venditore.",
      ],
    },
    {
      number: "05",
      title: "Prova e cura del prodotto",
      paragraphs: [
        "Puoi esaminare e provare il prodotto come faresti in negozio. Sei responsabile soltanto dell’eventuale diminuzione di valore dovuta a una manipolazione ulteriore rispetto a quella necessaria per stabilirne natura, caratteristiche e funzionamento.",
        "Quando possibile, restituisci il bene con confezione, accessori, protezioni ed etichette originali: la loro assenza non annulla automaticamente il diritto di recesso, ma può essere valutata se ha causato una diminuzione di valore.",
      ],
    },
    {
      number: "06",
      title: "Rimborso",
      paragraphs: [
        "Rimborseremo tutti i pagamenti ricevuti, compresi i costi della consegna standard, entro 14 giorni da quando siamo informati della decisione di recedere. Non sono rimborsati i costi supplementari derivanti dalla scelta di una consegna diversa da quella standard meno costosa offerta.",
        "Il rimborso utilizza lo stesso mezzo di pagamento dell’acquisto, salvo diverso accordo espresso e senza costi per il consumatore. Possiamo sospenderlo fino al ricevimento dei beni oppure fino alla prova della loro spedizione, se precedente.",
      ],
    },
    {
      number: "07",
      title: "Eccezioni",
      paragraphs: [
        "Il diritto di recesso non si applica nei casi previsti dall’articolo 59 del Codice del consumo. Per il catalogo moda possono rilevare, in particolare:",
      ],
      bullets: [
        "beni confezionati su misura o chiaramente personalizzati;",
        "beni sigillati che non si prestano a essere restituiti per motivi igienici o connessi alla protezione della salute, quando il sigillo è stato rimosso dopo la consegna.",
      ],
    },
    {
      number: "08",
      title: "Prodotti difettosi o non conformi",
      paragraphs: [
        "Il recesso per ripensamento è distinto dalla garanzia legale di conformità. Per i beni nuovi la garanzia legale opera per i difetti di conformità che si manifestano entro due anni dalla consegna, secondo il Codice del consumo.",
        "Segnala il problema a info@ekobit.it allegando, se utile, fotografie e numero d’ordine. Nei casi previsti, riparazione o sostituzione avvengono senza spese; quando tali rimedi non sono praticabili, si applicano la riduzione del prezzo o la risoluzione del contratto secondo legge.",
      ],
    },
  ],
  addressLabel: "Indirizzo per la restituzione",
  returnAddress: "Ekobit SRL\nVia Firenze 185\n88900 Crotone (KR)\nItalia",
  modelTitle: "Preferisci il modulo tipo?",
  modelCopy: "Scaricalo, compilalo e invialo a info@ekobit.it. Puoi usare anche una dichiarazione libera, purché la volontà di recedere sia inequivocabile.",
  downloadModel: "Scarica il modulo tipo",
  emailAlternative: "Invia la dichiarazione via email",
  sourcesTitle: "Riferimenti normativi",
  sourcesCopy: "Codice del consumo, D.Lgs. 206/2005, artt. 49 e 52–59; Direttiva 2011/83/UE sui diritti dei consumatori. La presente informativa non limita i diritti inderogabili riconosciuti al consumatore.",
  updated: "Aggiornata il 12 settembre 2026",
  form: {
    eyebrow: "Recesso online",
    title: "Recedere dal contratto qui",
    description: "Compila i dati essenziali. Non devi indicare un motivo; il campo relativo agli articoli serve solo se vuoi recedere da una parte dell’ordine.",
    name: "Nome e cognome",
    namePlaceholder: "Come indicato nell’ordine",
    email: "Email dell’ordine",
    emailPlaceholder: "nome@esempio.it",
    orderNumber: "Numero d’ordine",
    orderPlaceholder: "es. LCS-000123",
    items: "Articoli interessati (facoltativo)",
    itemsPlaceholder: "Lascia vuoto per recedere dall’intero ordine",
    itemsHint: "Non inserire il motivo del recesso se non desideri farlo.",
    declaration: "Dichiaro in modo inequivocabile di voler recedere dal contratto indicato.",
    submit: "Conferma recesso",
    submitting: "Trasmissione in corso…",
    privacy: "I dati sono utilizzati esclusivamente per gestire la richiesta e adempiere agli obblighi di legge.",
    successTitle: "Recesso trasmesso",
    successCopy: "La dichiarazione è stata registrata. Conserva la ricevuta con data, ora e contenuto della trasmissione.",
    successEmail: "Una copia è stata inviata anche all’indirizzo email indicato.",
    receipt: "Scarica di nuovo la ricevuta",
    retry: "Invia una nuova richiesta",
    fallback: "Non è stato possibile registrare la richiesta online. Puoi esercitare subito il recesso scrivendo a info@ekobit.it.",
  },
};

const en: ReturnsContent = {
  ...it,
  metaTitle: "Shipping and returns",
  metaDescription: "Information on delivery, withdrawal rights, returns, refunds and the legal guarantee for LCS purchases.",
  heroTitle: "Shipping",
  heroEmphasis: "and returns.",
  heroCopy: "Clear timing, simple steps and your rights always within reach, before and after purchase.",
  legalLabel: "LCS / Customer care",
  summaryTitle: "At a glance",
  summary: [
    { value: "14 days", label: "to notify withdrawal after delivery" },
    { value: "14 days", label: "to return after notification" },
    { value: "Same method", label: "used for the original payment" },
    { value: "No reason", label: "is required to withdraw" },
  ],
  navLabel: "On this page",
  nav: [
    { href: "#spedizione", label: "Shipping" }, { href: "#recesso", label: "Right of withdrawal" },
    { href: "#restituzione", label: "Return" }, { href: "#rimborso", label: "Refund" },
    { href: "#eccezioni", label: "Exceptions" }, { href: "#garanzia", label: "Non-conforming goods" },
    { href: "#richiedi-recesso", label: "Withdraw online" },
  ],
  sections: [
    { number: "01", title: "Shipping and delivery", paragraphs: ["Delivery methods, any charges and the destination are shown before the order is confirmed. Unless another deadline is agreed, delivery takes place without undue delay and no later than 30 days after the contract is concluded.", "If delivery does not take place within the agreed deadline, the consumer may ask the seller to deliver within an appropriate additional period and, where provided by law, terminate the contract."] },
    { number: "02", title: "Right of withdrawal", paragraphs: ["A consumer may withdraw from an online purchase without giving a reason within 14 days from the day on which the consumer, or a nominated third party other than the carrier, takes physical possession of the goods.", "For several goods ordered together and delivered separately, the period starts when the last item is delivered. Sending the withdrawal notice before the deadline is sufficient."] },
    { number: "03", title: "How to exercise it", paragraphs: ["Use the “Confirm withdrawal” function on this page or send an unequivocal statement within the deadline to info@ekobit.it. Include your name, order number and an electronic contact for confirmation.", "The online function issues a record you can keep, including the content, date and time of submission. You may also use the downloadable model form below, but this is not mandatory."] },
    { number: "04", title: "Returning the goods", paragraphs: ["After notifying us, return the goods without undue delay and no later than 14 days. The deadline is met if you hand the parcel to the carrier before it expires.", "The consumer bears the direct return cost. Keep proof of shipment until the refund is complete. The seller bears the necessary return costs for defective, damaged or incorrect goods."] },
    { number: "05", title: "Trying and caring for the item", paragraphs: ["You may inspect and try the item as you would in a shop. You are liable only for diminished value resulting from handling beyond what is necessary to establish its nature, characteristics and functioning.", "Where possible, return the item with its original packaging, accessories, protections and tags. Their absence does not automatically remove the right of withdrawal, but may be considered if it has caused diminished value."] },
    { number: "06", title: "Refund", paragraphs: ["We will refund all payments received, including standard delivery charges, within 14 days of being informed of the withdrawal. Additional costs resulting from a delivery option other than the least expensive standard option offered are excluded.", "The refund is made using the same payment method, unless expressly agreed otherwise, at no cost to the consumer. We may withhold it until the goods are received or proof of return is provided, whichever is earlier."] },
    { number: "07", title: "Exceptions", paragraphs: ["The right of withdrawal does not apply in the cases listed in Article 59 of the Italian Consumer Code. For a fashion catalogue, the most relevant may include:"], bullets: ["made-to-measure or clearly personalised goods;", "sealed goods unsuitable for return for health protection or hygiene reasons once unsealed after delivery."] },
    { number: "08", title: "Defective or non-conforming goods", paragraphs: ["Withdrawal for change of mind is separate from the statutory conformity guarantee. New goods are covered for conformity defects appearing within two years of delivery under the Italian Consumer Code.", "Contact info@ekobit.it with the order number and, where useful, photographs. Repair or replacement is free of charge where applicable; when those remedies are unavailable, the statutory price reduction or termination remedies apply."] },
  ],
  addressLabel: "Return address",
  modelTitle: "Prefer the model form?",
  modelCopy: "Download it, complete it and email it to info@ekobit.it. You may also use your own wording, provided your decision to withdraw is unequivocal.",
  downloadModel: "Download model form",
  emailAlternative: "Send the statement by email",
  sourcesTitle: "Legal references",
  sourcesCopy: "Italian Consumer Code, Legislative Decree 206/2005, Articles 49 and 52–59; Directive 2011/83/EU on consumer rights. This notice does not limit any mandatory consumer rights.",
  updated: "Updated 12 September 2026",
  form: {
    ...it.form,
    eyebrow: "Online withdrawal", title: "Withdraw from the contract here", description: "Enter the essential details. No reason is required; list items only if you wish to withdraw from part of the order.",
    name: "Full name", namePlaceholder: "As shown on the order", email: "Order email", emailPlaceholder: "name@example.com", orderNumber: "Order number", orderPlaceholder: "e.g. LCS-000123",
    items: "Items concerned (optional)", itemsPlaceholder: "Leave blank to withdraw from the entire order", itemsHint: "You do not need to state a reason.",
    declaration: "I unequivocally declare that I wish to withdraw from the specified contract.", submit: "Confirm withdrawal", submitting: "Submitting…",
    privacy: "The data is used only to process this request and comply with legal obligations.", successTitle: "Withdrawal submitted", successCopy: "Your statement has been recorded. Keep the receipt containing its content, date and time.", successEmail: "A copy has also been sent to the email address provided.", receipt: "Download the receipt again", retry: "Submit another request", fallback: "The request could not be recorded online. You can exercise your right immediately by emailing info@ekobit.it.",
  },
};

const fr: ReturnsContent = {
  ...it,
  metaTitle: "Livraisons et retours", metaDescription: "Informations sur la livraison, le droit de rétractation, les retours, les remboursements et la garantie légale des achats LCS.",
  heroTitle: "Livraisons", heroEmphasis: "et retours.", heroCopy: "Des délais clairs, des étapes simples et vos droits toujours accessibles, avant et après l’achat.", legalLabel: "LCS / Assistance", summaryTitle: "En bref",
  summary: [{ value: "14 jours", label: "pour notifier la rétractation après livraison" }, { value: "14 jours", label: "pour retourner après notification" }, { value: "Même moyen", label: "que celui utilisé pour le paiement" }, { value: "Sans motif", label: "pour exercer la rétractation" }],
  navLabel: "Dans cette page", nav: [{ href: "#spedizione", label: "Livraison" }, { href: "#recesso", label: "Droit de rétractation" }, { href: "#restituzione", label: "Retour" }, { href: "#rimborso", label: "Remboursement" }, { href: "#eccezioni", label: "Exceptions" }, { href: "#garanzia", label: "Produits non conformes" }, { href: "#richiedi-recesso", label: "Se rétracter en ligne" }],
  sections: [
    { number: "01", title: "Expédition et livraison", paragraphs: ["Les modalités, les éventuels frais et la destination sont indiqués avant la confirmation de la commande. Sauf délai différent convenu, la livraison intervient sans retard injustifié et au plus tard 30 jours après la conclusion du contrat.", "En cas de retard, le consommateur peut demander une livraison dans un délai supplémentaire approprié et, dans les cas prévus par la loi, résoudre le contrat."] },
    { number: "02", title: "Droit de rétractation", paragraphs: ["Le consommateur peut se rétracter d’un achat en ligne sans motif dans les 14 jours suivant la prise de possession physique des biens par lui-même ou un tiers désigné autre que le transporteur.", "Pour plusieurs biens commandés ensemble et livrés séparément, le délai court à partir du dernier bien. Il suffit d’envoyer la notification avant l’expiration du délai."] },
    { number: "03", title: "Comment l’exercer", paragraphs: ["Utilisez la fonction « Confirmer la rétractation » sur cette page ou envoyez une déclaration sans équivoque à info@ekobit.it avant l’échéance. Indiquez votre nom, le numéro de commande et un contact électronique.", "La fonction en ligne fournit un reçu conservable indiquant le contenu, la date et l’heure de l’envoi. Le formulaire type téléchargeable est facultatif."] },
    { number: "04", title: "Retour des biens", paragraphs: ["Après notification, retournez les biens sans retard injustifié et au plus tard sous 14 jours. Le délai est respecté si le colis est remis au transporteur avant son expiration.", "Les coûts directs du retour sont à la charge du consommateur. Conservez la preuve d’envoi. Pour les biens défectueux, endommagés ou incorrects, les frais nécessaires sont à la charge du vendeur."] },
    { number: "05", title: "Essai et soin du produit", paragraphs: ["Vous pouvez examiner et essayer le produit comme en magasin. Vous n’êtes responsable que de la dépréciation résultant de manipulations autres que celles nécessaires pour en établir la nature, les caractéristiques et le fonctionnement.", "Si possible, retournez l’article avec emballage, accessoires, protections et étiquettes d’origine. Leur absence ne supprime pas automatiquement le droit, mais peut être prise en compte si elle a causé une dépréciation."] },
    { number: "06", title: "Remboursement", paragraphs: ["Nous remboursons tous les paiements reçus, y compris les frais de livraison standard, sous 14 jours après notification. Les suppléments liés à un mode de livraison plus coûteux que l’option standard la moins chère sont exclus.", "Le même moyen de paiement est utilisé, sauf accord exprès contraire, sans frais. Le remboursement peut être différé jusqu’à réception des biens ou preuve de leur expédition, la première date étant retenue."] },
    { number: "07", title: "Exceptions", paragraphs: ["Le droit de rétractation ne s’applique pas dans les cas de l’article 59 du Code italien de la consommation. Pour la mode, peuvent notamment être concernés :"], bullets: ["les biens confectionnés sur mesure ou clairement personnalisés ;", "les biens scellés impropres au retour pour des raisons d’hygiène ou de protection de la santé après ouverture du sceau."] },
    { number: "08", title: "Produits défectueux ou non conformes", paragraphs: ["La rétractation est distincte de la garantie légale de conformité. Les biens neufs sont couverts pour les défauts apparaissant dans les deux ans suivant la livraison, conformément au Code italien de la consommation.", "Contactez info@ekobit.it avec le numéro de commande et, si utile, des photos. La réparation ou le remplacement sont sans frais lorsqu’ils sont applicables ; à défaut, les remèdes légaux de réduction du prix ou de résolution s’appliquent."] },
  ],
  addressLabel: "Adresse de retour", modelTitle: "Vous préférez le formulaire type ?", modelCopy: "Téléchargez-le, complétez-le et envoyez-le à info@ekobit.it. Une déclaration libre est également valable si la volonté de se rétracter est sans équivoque.", downloadModel: "Télécharger le formulaire type", emailAlternative: "Envoyer la déclaration par e-mail", sourcesTitle: "Références juridiques", sourcesCopy: "Code italien de la consommation, décret législatif 206/2005, articles 49 et 52–59 ; directive 2011/83/UE. Cette information ne limite aucun droit impératif du consommateur.", updated: "Mise à jour le 12 septembre 2026",
  form: { ...it.form, eyebrow: "Rétractation en ligne", title: "Se rétracter du contrat ici", description: "Renseignez les données essentielles. Aucun motif n’est requis ; indiquez les articles uniquement pour une rétractation partielle.", name: "Nom et prénom", namePlaceholder: "Comme sur la commande", email: "E-mail de la commande", emailPlaceholder: "nom@exemple.fr", orderNumber: "Numéro de commande", orderPlaceholder: "ex. LCS-000123", items: "Articles concernés (facultatif)", itemsPlaceholder: "Laisser vide pour toute la commande", itemsHint: "Vous n’avez pas à indiquer de motif.", declaration: "Je déclare sans équivoque vouloir me rétracter du contrat indiqué.", submit: "Confirmer la rétractation", submitting: "Envoi en cours…", privacy: "Les données servent uniquement à traiter la demande et respecter les obligations légales.", successTitle: "Rétractation transmise", successCopy: "Votre déclaration a été enregistrée. Conservez le reçu avec son contenu, sa date et son heure.", successEmail: "Une copie a également été envoyée à l’adresse indiquée.", receipt: "Télécharger à nouveau le reçu", retry: "Envoyer une autre demande", fallback: "La demande n’a pas pu être enregistrée en ligne. Vous pouvez exercer immédiatement votre droit par e-mail à info@ekobit.it." },
};

const es: ReturnsContent = {
  ...it,
  metaTitle: "Envíos y devoluciones", metaDescription: "Información sobre entrega, desistimiento, devoluciones, reembolsos y garantía legal para las compras LCS.", heroTitle: "Envíos", heroEmphasis: "y devoluciones.", heroCopy: "Plazos claros, pasos sencillos y tus derechos siempre accesibles, antes y después de la compra.", legalLabel: "LCS / Atención", summaryTitle: "En resumen",
  summary: [{ value: "14 días", label: "para comunicar el desistimiento" }, { value: "14 días", label: "para devolver tras comunicarlo" }, { value: "Mismo medio", label: "utilizado para el pago" }, { value: "Sin motivo", label: "para ejercer el desistimiento" }],
  navLabel: "En esta página", nav: [{ href: "#spedizione", label: "Envío" }, { href: "#recesso", label: "Derecho de desistimiento" }, { href: "#restituzione", label: "Devolución" }, { href: "#rimborso", label: "Reembolso" }, { href: "#eccezioni", label: "Excepciones" }, { href: "#garanzia", label: "Productos no conformes" }, { href: "#richiedi-recesso", label: "Desistir en línea" }],
  sections: [
    { number: "01", title: "Envío y entrega", paragraphs: ["Las modalidades, posibles costes y destino se muestran antes de confirmar el pedido. Salvo que se acuerde otro plazo, la entrega se realiza sin demora indebida y, como máximo, 30 días después de celebrar el contrato.", "Si no se entrega en el plazo acordado, el consumidor puede requerir la entrega en un plazo adicional adecuado y, cuando la ley lo permita, resolver el contrato."] },
    { number: "02", title: "Derecho de desistimiento", paragraphs: ["El consumidor puede desistir de una compra en línea sin indicar motivo dentro de los 14 días desde que él o un tercero designado distinto del transportista recibe físicamente los bienes.", "Para varios bienes pedidos juntos y entregados por separado, el plazo comienza con el último bien. Basta enviar la comunicación antes de que venza."] },
    { number: "03", title: "Cómo ejercerlo", paragraphs: ["Utiliza la función «Confirmar desistimiento» de esta página o envía una declaración inequívoca dentro del plazo a info@ekobit.it. Incluye nombre, número de pedido y un contacto electrónico.", "La función en línea genera un recibo conservable con el contenido, la fecha y la hora. También puedes utilizar el formulario tipo descargable, aunque no es obligatorio."] },
    { number: "04", title: "Devolución de los bienes", paragraphs: ["Tras comunicarlo, devuelve los bienes sin demora indebida y, como máximo, en 14 días. El plazo se cumple si entregas el paquete al transportista antes de su vencimiento.", "El consumidor asume el coste directo de devolución. Conserva el justificante. Para bienes defectuosos, dañados o incorrectos, el vendedor asume los costes necesarios."] },
    { number: "05", title: "Prueba y cuidado del producto", paragraphs: ["Puedes examinar y probar el artículo como en una tienda. Solo respondes de la disminución de valor por una manipulación distinta de la necesaria para determinar su naturaleza, características y funcionamiento.", "Cuando sea posible, devuelve el artículo con embalaje, accesorios, protecciones y etiquetas originales. Su ausencia no elimina automáticamente el derecho, pero puede valorarse si causó una disminución de valor."] },
    { number: "06", title: "Reembolso", paragraphs: ["Reembolsaremos todos los pagos, incluidos los gastos de entrega estándar, dentro de los 14 días siguientes a la comunicación. Se excluyen los suplementos de una entrega más cara que la modalidad estándar menos costosa ofrecida.", "Se utiliza el mismo medio de pago, salvo acuerdo expreso distinto, sin costes. Podemos retener el reembolso hasta recibir los bienes o la prueba de envío, lo que ocurra primero."] },
    { number: "07", title: "Excepciones", paragraphs: ["El derecho no se aplica en los casos del artículo 59 del Código italiano de Consumo. Para moda pueden ser especialmente relevantes:"], bullets: ["bienes hechos a medida o claramente personalizados;", "bienes precintados no aptos para devolución por higiene o protección de la salud una vez desprecintados tras la entrega."] },
    { number: "08", title: "Productos defectuosos o no conformes", paragraphs: ["El desistimiento es distinto de la garantía legal de conformidad. Los bienes nuevos están cubiertos por defectos que aparezcan dentro de los dos años desde la entrega conforme al Código italiano de Consumo.", "Contacta con info@ekobit.it con el número de pedido y, si ayuda, fotografías. La reparación o sustitución son gratuitas cuando procedan; en otro caso se aplican los remedios legales de reducción del precio o resolución."] },
  ],
  addressLabel: "Dirección de devolución", modelTitle: "¿Prefieres el formulario tipo?", modelCopy: "Descárgalo, complétalo y envíalo a info@ekobit.it. También sirve una declaración libre si la voluntad de desistir es inequívoca.", downloadModel: "Descargar formulario tipo", emailAlternative: "Enviar declaración por email", sourcesTitle: "Referencias legales", sourcesCopy: "Código italiano de Consumo, Decreto Legislativo 206/2005, artículos 49 y 52–59; Directiva 2011/83/UE. Esta información no limita los derechos imperativos del consumidor.", updated: "Actualizada el 12 de septiembre de 2026",
  form: { ...it.form, eyebrow: "Desistimiento en línea", title: "Desistir del contrato aquí", description: "Completa los datos esenciales. No tienes que indicar un motivo; especifica los artículos solo para un desistimiento parcial.", name: "Nombre y apellidos", namePlaceholder: "Como figura en el pedido", email: "Email del pedido", emailPlaceholder: "nombre@ejemplo.es", orderNumber: "Número de pedido", orderPlaceholder: "p. ej. LCS-000123", items: "Artículos afectados (opcional)", itemsPlaceholder: "Déjalo vacío para todo el pedido", itemsHint: "No es necesario indicar el motivo.", declaration: "Declaro inequívocamente que deseo desistir del contrato indicado.", submit: "Confirmar desistimiento", submitting: "Enviando…", privacy: "Los datos se utilizan únicamente para tramitar la solicitud y cumplir obligaciones legales.", successTitle: "Desistimiento enviado", successCopy: "Tu declaración ha quedado registrada. Conserva el recibo con su contenido, fecha y hora.", successEmail: "También se ha enviado una copia al email indicado.", receipt: "Descargar de nuevo el recibo", retry: "Enviar otra solicitud", fallback: "No se pudo registrar la solicitud en línea. Puedes ejercer tu derecho inmediatamente escribiendo a info@ekobit.it." },
};

const de: ReturnsContent = {
  ...it,
  metaTitle: "Versand und Rückgabe", metaDescription: "Informationen zu Lieferung, Widerruf, Rücksendung, Erstattung und gesetzlicher Gewährleistung für LCS-Käufe.", heroTitle: "Versand", heroEmphasis: "und Rückgabe.", heroCopy: "Klare Fristen, einfache Schritte und Ihre Rechte jederzeit zugänglich – vor und nach dem Kauf.", legalLabel: "LCS / Kundenservice", summaryTitle: "Kurz erklärt",
  summary: [{ value: "14 Tage", label: "für die Widerrufserklärung" }, { value: "14 Tage", label: "für die Rücksendung danach" }, { value: "Gleiches Mittel", label: "wie bei der ursprünglichen Zahlung" }, { value: "Ohne Grund", label: "kann widerrufen werden" }],
  navLabel: "Auf dieser Seite", nav: [{ href: "#spedizione", label: "Versand" }, { href: "#recesso", label: "Widerrufsrecht" }, { href: "#restituzione", label: "Rücksendung" }, { href: "#rimborso", label: "Erstattung" }, { href: "#eccezioni", label: "Ausnahmen" }, { href: "#garanzia", label: "Mangelhafte Ware" }, { href: "#richiedi-recesso", label: "Online widerrufen" }],
  sections: [
    { number: "01", title: "Versand und Lieferung", paragraphs: ["Lieferart, etwaige Kosten und Zielort werden vor Bestätigung der Bestellung angezeigt. Sofern keine andere Frist vereinbart wurde, erfolgt die Lieferung unverzüglich, spätestens jedoch 30 Tage nach Vertragsschluss.", "Erfolgt die Lieferung nicht fristgerecht, kann der Verbraucher eine angemessene Nachfrist setzen und den Vertrag in den gesetzlich vorgesehenen Fällen beenden."] },
    { number: "02", title: "Widerrufsrecht", paragraphs: ["Verbraucher können einen Onlinekauf innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen. Die Frist beginnt, wenn sie oder ein benannter Dritter, der nicht Beförderer ist, die Ware physisch erhalten.", "Bei gemeinsam bestellten, getrennt gelieferten Waren beginnt die Frist mit der letzten Lieferung. Es genügt, die Erklärung vor Fristablauf abzusenden."] },
    { number: "03", title: "Ausübung des Widerrufs", paragraphs: ["Nutzen Sie die Funktion „Widerruf bestätigen“ auf dieser Seite oder senden Sie fristgerecht eine eindeutige Erklärung an info@ekobit.it. Geben Sie Namen, Bestellnummer und einen elektronischen Kontakt an.", "Die Onlinefunktion stellt einen speicherbaren Beleg mit Inhalt, Datum und Uhrzeit bereit. Das herunterladbare Musterformular kann verwendet werden, ist aber nicht verpflichtend."] },
    { number: "04", title: "Rücksendung der Ware", paragraphs: ["Nach der Mitteilung ist die Ware unverzüglich und spätestens binnen 14 Tagen zurückzusenden. Die Frist ist gewahrt, wenn das Paket vorher dem Beförderer übergeben wird.", "Die unmittelbaren Rücksendekosten trägt der Verbraucher. Bewahren Sie den Versandnachweis auf. Bei mangelhafter, beschädigter oder falscher Ware trägt der Verkäufer die notwendigen Kosten."] },
    { number: "05", title: "Prüfung und Umgang", paragraphs: ["Sie dürfen die Ware wie im Geschäft prüfen und anprobieren. Sie haften nur für einen Wertverlust durch einen Umgang, der zur Prüfung von Beschaffenheit, Eigenschaften und Funktionsweise nicht notwendig war.", "Senden Sie die Ware nach Möglichkeit mit Originalverpackung, Zubehör, Schutzmaterial und Etiketten zurück. Deren Fehlen beseitigt das Recht nicht automatisch, kann aber bei einem dadurch entstandenen Wertverlust berücksichtigt werden."] },
    { number: "06", title: "Erstattung", paragraphs: ["Wir erstatten alle erhaltenen Zahlungen einschließlich der Standardlieferkosten binnen 14 Tagen nach Eingang des Widerrufs. Mehrkosten einer teureren als der günstigsten angebotenen Standardlieferung sind ausgenommen.", "Die Erstattung erfolgt mit demselben Zahlungsmittel, sofern nichts anderes ausdrücklich vereinbart wurde, ohne Kosten. Sie kann bis zum Eingang der Ware oder bis zum früheren Versandnachweis zurückgehalten werden."] },
    { number: "07", title: "Ausnahmen", paragraphs: ["Das Widerrufsrecht entfällt in den Fällen des Artikels 59 des italienischen Verbrauchergesetzbuchs. Für Mode können insbesondere relevant sein:"], bullets: ["nach Kundenspezifikation angefertigte oder eindeutig personalisierte Waren;", "versiegelte Waren, die aus Gesundheits- oder Hygienegründen nicht zur Rückgabe geeignet sind, wenn die Versiegelung nach Lieferung entfernt wurde."] },
    { number: "08", title: "Mangelhafte oder nicht vertragsgemäße Ware", paragraphs: ["Der Widerruf ist von der gesetzlichen Konformitätsgarantie zu unterscheiden. Neue Waren sind nach dem italienischen Verbrauchergesetzbuch für Mängel geschützt, die innerhalb von zwei Jahren nach Lieferung auftreten.", "Kontaktieren Sie info@ekobit.it mit Bestellnummer und gegebenenfalls Fotos. Reparatur oder Ersatz erfolgen, soweit anwendbar, kostenlos; andernfalls gelten die gesetzlichen Rechte auf Preisminderung oder Vertragsbeendigung."] },
  ],
  addressLabel: "Rücksendeadresse", modelTitle: "Möchten Sie das Musterformular?", modelCopy: "Laden Sie es herunter, füllen Sie es aus und senden Sie es an info@ekobit.it. Eine eigene eindeutige Erklärung ist ebenfalls möglich.", downloadModel: "Musterformular herunterladen", emailAlternative: "Erklärung per E-Mail senden", sourcesTitle: "Rechtsgrundlagen", sourcesCopy: "Italienisches Verbrauchergesetzbuch, Gesetzesdekret 206/2005, Artikel 49 und 52–59; Richtlinie 2011/83/EU. Diese Hinweise beschränken keine zwingenden Verbraucherrechte.", updated: "Aktualisiert am 12. September 2026",
  form: { ...it.form, eyebrow: "Online-Widerruf", title: "Vertrag hier widerrufen", description: "Geben Sie die wesentlichen Daten ein. Ein Grund ist nicht erforderlich; Artikel müssen nur bei einem teilweisen Widerruf angegeben werden.", name: "Vor- und Nachname", namePlaceholder: "Wie in der Bestellung", email: "E-Mail der Bestellung", emailPlaceholder: "name@beispiel.de", orderNumber: "Bestellnummer", orderPlaceholder: "z. B. LCS-000123", items: "Betroffene Artikel (optional)", itemsPlaceholder: "Leer lassen für die gesamte Bestellung", itemsHint: "Sie müssen keinen Grund angeben.", declaration: "Ich erkläre eindeutig, dass ich den angegebenen Vertrag widerrufen möchte.", submit: "Widerruf bestätigen", submitting: "Wird übermittelt…", privacy: "Die Daten werden nur zur Bearbeitung und Erfüllung gesetzlicher Pflichten verwendet.", successTitle: "Widerruf übermittelt", successCopy: "Ihre Erklärung wurde erfasst. Bewahren Sie den Beleg mit Inhalt, Datum und Uhrzeit auf.", successEmail: "Eine Kopie wurde auch an die angegebene E-Mail-Adresse gesendet.", receipt: "Beleg erneut herunterladen", retry: "Weitere Anfrage senden", fallback: "Die Anfrage konnte online nicht erfasst werden. Sie können Ihr Recht sofort per E-Mail an info@ekobit.it ausüben." },
};

export const returnsContent: Record<Locale, ReturnsContent> = { it, en, fr, es, de };
