import type { Locale } from "@/lib/i18n";

type HelpCopy = { title: string; intro: string; sections: { title: string; text: string }[]; contact: string; back: string };
export const sizeHelp: Record<Locale, HelpCopy> = {
  it: { title: "Guida alle taglie", intro: "La vestibilità cambia in base al marchio e al modello. Le taglie disponibili nella scheda sono quelle comunicate dal produttore.", sections: [
    { title: "Prendi le misure", text: "Usa un metro morbido senza stringere: misura il torace nel punto più ampio, la vita nel punto più stretto e i fianchi nel punto più ampio. Per le scarpe, misura entrambi i piedi dal tallone al dito più lungo." },
    { title: "Confronta con un capo che indossi", text: "Tieni a portata di mano le misure di un capo simile che ti veste bene. Le sigle S, M, L e i numeri possono corrispondere a sistemi diversi: non usare una conversione universale tra marchi." },
    { title: "Un consiglio sul tuo articolo", text: "Per verificare misure e vestibilità scrivici indicando il nome o il codice del prodotto, la taglia che stai valutando e le tue misure. Ti aiutiamo a scegliere prima dell'acquisto." },
  ], contact: "Chiedi un consiglio sulla taglia", back: "Torna al catalogo" },
  en: { title: "Size guide", intro: "Fit varies by brand and style. Product pages show the sizes supplied by the manufacturer.", sections: [
    { title: "Take your measurements", text: "Use a soft tape without tightening it: measure the fullest part of your chest, the narrowest part of your waist and the fullest part of your hips. For shoes, measure both feet from heel to longest toe." },
    { title: "Compare with a garment you wear", text: "Keep the measurements of a similar, well-fitting garment handy. S, M, L and numerical sizes may use different systems; avoid a universal conversion across brands." },
    { title: "Advice for your item", text: "Email us the product name or code, the size you are considering and your measurements so we can help you check the fit before buying." },
  ], contact: "Ask about sizing", back: "Back to shop" },
  fr: { title: "Guide des tailles", intro: "La coupe varie selon la marque et le modèle. Les tailles affichées sont celles du fabricant.", sections: [
    { title: "Prenez vos mesures", text: "Utilisez un mètre souple sans serrer : poitrine et hanches au point le plus large, taille au point le plus étroit. Pour les chaussures, mesurez les deux pieds du talon à l'orteil le plus long." },
    { title: "Comparez avec un vêtement", text: "Utilisez les mesures d'un vêtement similaire qui vous va bien. Les tailles alphabétiques et numériques varient selon les marques : une conversion universelle n'est pas fiable." },
    { title: "Un conseil personnalisé", text: "Envoyez-nous le nom ou le code du produit, la taille envisagée et vos mesures pour vérifier la coupe avant l'achat." },
  ], contact: "Demander un conseil", back: "Retour à la boutique" },
  es: { title: "Guía de tallas", intro: "El ajuste varía según la marca y el modelo. Las tallas mostradas son las indicadas por el fabricante.", sections: [
    { title: "Toma tus medidas", text: "Usa una cinta flexible sin apretar: mide pecho y caderas en la parte más ancha y cintura en la más estrecha. Para calzado, mide ambos pies del talón al dedo más largo." },
    { title: "Compara con una prenda", text: "Utiliza las medidas de una prenda similar que te quede bien. Las tallas alfabéticas y numéricas varían entre marcas; no uses una conversión universal." },
    { title: "Consejo para tu artículo", text: "Envíanos el nombre o código del producto, la talla que estás valorando y tus medidas para comprobar el ajuste antes de comprar." },
  ], contact: "Consultar la talla", back: "Volver a la tienda" },
  de: { title: "Größenberatung", intro: "Die Passform hängt von Marke und Modell ab. Die angezeigten Größen stammen vom Hersteller.", sections: [
    { title: "Maße nehmen", text: "Messen Sie mit einem weichen Maßband ohne es festzuziehen: Brust und Hüfte an der breitesten, Taille an der schmalsten Stelle. Messen Sie für Schuhe beide Füße von der Ferse bis zum längsten Zeh." },
    { title: "Mit einem Kleidungsstück vergleichen", text: "Nutzen Sie die Maße eines ähnlichen, gut sitzenden Kleidungsstücks. Buchstaben- und Zahlengrößen unterscheiden sich je nach Marke; eine allgemeine Umrechnung ist nicht zuverlässig." },
    { title: "Beratung zu Ihrem Artikel", text: "Senden Sie uns Produktname oder Artikelnummer, die gewünschte Größe und Ihre Maße. Wir helfen Ihnen, die Passform vor dem Kauf einzuschätzen." },
  ], contact: "Größenberatung anfragen", back: "Zurück zum Shop" },
};

export const paymentHelp: Record<Locale, HelpCopy> = {
  it: { title: "Pagamenti", intro: "Puoi consultare i metodi di pagamento prima di aggiungere un prodotto al carrello. Le opzioni effettivamente disponibili sono mostrate al checkout.", sections: [
    { title: "Carta di credito o debito", text: "Inserisci i dati della carta nei campi di pagamento Stripe. La tua banca può richiedere una conferma aggiuntiva per autorizzare il pagamento." },
    { title: "PayPal", text: "Se disponibile al checkout, scegli PayPal e segui i passaggi per autorizzare il pagamento con il tuo conto." },
    { title: "Bonifico bancario", text: "Se disponibile al checkout, ricevi le istruzioni e il riferimento da usare per il bonifico. L'ordine viene preparato dopo la conferma dell'accredito." },
    { title: "Importo e assistenza", text: "Il riepilogo del checkout mostra il totale prima della conferma. In caso di pagamento in attesa o di dubbi, contattaci indicando il numero d'ordine; evita di ripetere il pagamento senza verificarne lo stato." },
  ], contact: "Contatta l'assistenza", back: "Torna al catalogo" },
  en: { title: "Payments", intro: "Read about payment methods before adding an item. The options available for your order are shown at checkout.", sections: [
    { title: "Credit or debit card", text: "Enter your card details in Stripe's payment fields. Your bank may ask for additional confirmation to authorise payment." },
    { title: "PayPal", text: "When available at checkout, choose PayPal and follow the steps to authorise payment using your account." },
    { title: "Bank transfer", text: "When available, checkout provides transfer instructions and a payment reference. The order is prepared after receipt of payment is confirmed." },
    { title: "Total and support", text: "Checkout shows the total before confirmation. If payment is pending or unclear, contact us with your order number before attempting another payment." },
  ], contact: "Contact support", back: "Back to shop" },
  fr: { title: "Paiements", intro: "Consultez les moyens de paiement avant d'ajouter un article. Les options disponibles sont affichées au paiement.", sections: [
    { title: "Carte bancaire", text: "Saisissez les données de votre carte dans les champs Stripe. Votre banque peut demander une confirmation supplémentaire." },
    { title: "PayPal", text: "Si disponible, choisissez PayPal et suivez les étapes d'autorisation avec votre compte." },
    { title: "Virement bancaire", text: "Si disponible, les instructions et la référence du virement sont fournies au paiement. La commande est préparée après confirmation de réception des fonds." },
    { title: "Montant et assistance", text: "Le total est affiché avant confirmation. Si le paiement est en attente, contactez-nous avec le numéro de commande avant de payer à nouveau." },
  ], contact: "Contacter l'assistance", back: "Retour à la boutique" },
  es: { title: "Pagos", intro: "Consulta los métodos de pago antes de añadir un artículo. Las opciones disponibles se muestran al finalizar la compra.", sections: [
    { title: "Tarjeta de crédito o débito", text: "Introduce los datos en los campos de Stripe. Tu banco puede solicitar una confirmación adicional." },
    { title: "PayPal", text: "Si está disponible, elige PayPal y sigue los pasos para autorizar el pago con tu cuenta." },
    { title: "Transferencia bancaria", text: "Si está disponible, recibirás las instrucciones y la referencia para la transferencia. El pedido se prepara tras confirmar la recepción del importe." },
    { title: "Importe y asistencia", text: "El total aparece antes de confirmar. Si el pago está pendiente, contacta con nosotros indicando el número de pedido antes de volver a pagar." },
  ], contact: "Contactar con asistencia", back: "Volver a la tienda" },
  de: { title: "Zahlungen", intro: "Informieren Sie sich über Zahlungsarten, bevor Sie einen Artikel hinzufügen. Verfügbare Optionen werden an der Kasse angezeigt.", sections: [
    { title: "Kredit- oder Debitkarte", text: "Geben Sie Ihre Kartendaten in die Stripe-Zahlungsfelder ein. Ihre Bank kann eine zusätzliche Bestätigung verlangen." },
    { title: "PayPal", text: "Wenn verfügbar, wählen Sie PayPal und folgen Sie den Schritten zur Freigabe über Ihr Konto." },
    { title: "Banküberweisung", text: "Wenn verfügbar, erhalten Sie Anweisungen und den Verwendungszweck. Die Bestellung wird nach Bestätigung des Zahlungseingangs vorbereitet." },
    { title: "Betrag und Hilfe", text: "Der Gesamtbetrag wird vor der Bestätigung angezeigt. Kontaktieren Sie uns bei ausstehenden Zahlungen mit Ihrer Bestellnummer, bevor Sie erneut bezahlen." },
  ], contact: "Support kontaktieren", back: "Zurück zum Shop" },
};
