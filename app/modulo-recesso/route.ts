import { getRequestLocale } from "@/lib/i18n-server";

const forms = {
  it: `MODULO TIPO DI RECESSO

Destinatario:
Ekobit SRL
Via Firenze 185
88900 Crotone (KR), Italia
Email: info@ekobit.it

Con la presente io/noi (*) notifichiamo il recesso dal contratto di vendita dei seguenti beni (*) / per la prestazione del seguente servizio (*):

____________________________________________________________________

Numero d'ordine: ____________________________________________________

Ordinato il (*) / ricevuto il (*): __________________________________

Nome del/dei consumatore/i: _________________________________________

Indirizzo del/dei consumatore/i: ____________________________________

____________________________________________________________________

Firma del/dei consumatore/i (solo se il modulo è notificato su carta):

____________________________________________________________________

Data: ______________________

(*) Cancellare la dicitura non pertinente.`,
  en: `MODEL WITHDRAWAL FORM

To:
Ekobit SRL
Via Firenze 185
88900 Crotone (KR), Italy
Email: info@ekobit.it

I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*) / for the provision of the following service (*):

____________________________________________________________________

Order number: _______________________________________________________

Ordered on (*) / received on (*): ___________________________________

Name of consumer(s): ________________________________________________

Address of consumer(s): _____________________________________________

____________________________________________________________________

Signature of consumer(s) (only if this form is notified on paper):

____________________________________________________________________

Date: ______________________

(*) Delete as appropriate.`,
  fr: `FORMULAIRE TYPE DE RÉTRACTATION

À l’attention de :
Ekobit SRL
Via Firenze 185
88900 Crotone (KR), Italie
E-mail : info@ekobit.it

Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du/des bien(s) (*) / la prestation du service (*) ci-dessous :

____________________________________________________________________

Numéro de commande : ________________________________________________

Commandé le (*) / reçu le (*) : _____________________________________

Nom du/des consommateur(s) : ________________________________________

Adresse du/des consommateur(s) : ____________________________________

____________________________________________________________________

Signature (uniquement en cas de notification papier) :

____________________________________________________________________

Date : ______________________

(*) Rayez la mention inutile.`,
  es: `FORMULARIO MODELO DE DESISTIMIENTO

A la atención de:
Ekobit SRL
Via Firenze 185
88900 Crotone (KR), Italia
Email: info@ekobit.it

Por la presente comunico/comunicamos (*) que desisto/desistimos (*) de mi/nuestro (*) contrato de venta de los siguientes bienes (*) / prestación del siguiente servicio (*):

____________________________________________________________________

Número de pedido: ___________________________________________________

Pedido el (*) / recibido el (*): ____________________________________

Nombre del/de los consumidor(es): ___________________________________

Dirección del/de los consumidor(es): _________________________________

____________________________________________________________________

Firma (solo si se presenta en papel):

____________________________________________________________________

Fecha: ______________________

(*) Táchese lo que no proceda.`,
  de: `MUSTER-WIDERRUFSFORMULAR

An:
Ekobit SRL
Via Firenze 185
88900 Crotone (KR), Italien
E-Mail: info@ekobit.it

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*):

____________________________________________________________________

Bestellnummer: ______________________________________________________

Bestellt am (*) / erhalten am (*): __________________________________

Name des/der Verbraucher(s): ________________________________________

Anschrift des/der Verbraucher(s): ___________________________________

____________________________________________________________________

Unterschrift (nur bei Mitteilung auf Papier):

____________________________________________________________________

Datum: ______________________

(*) Unzutreffendes streichen.`,
};

export async function GET() {
  const locale = await getRequestLocale();
  return new Response(forms[locale], {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="lcs-withdrawal-form-${locale}.txt"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
