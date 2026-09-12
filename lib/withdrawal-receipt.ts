import type { Locale } from "@/lib/i18n";

type ReceiptInput = {
  receiptCode: string;
  submittedAt: string;
  customerName: string;
  email: string;
  orderNumber: string;
  itemsDescription: string | null;
  locale: Locale;
};

const labels: Record<Locale, {
  title: string;
  statement: string;
  fullOrder: string;
  code: string;
  submitted: string;
  customer: string;
  email: string;
  order: string;
  items: string;
  recipient: string;
  keep: string;
  subject: string;
}> = {
  it: { title: "RICEVUTA DI RECESSO LCS", statement: "Con la presente il cliente comunica in modo inequivocabile la decisione di recedere dal contratto indicato.", fullOrder: "Intero ordine", code: "Codice ricevuta", submitted: "Data e ora di trasmissione", customer: "Cliente", email: "Email", order: "Ordine", items: "Articoli interessati", recipient: "Destinatario", keep: "Conserva questa ricevuta come prova della trasmissione della dichiarazione di recesso.", subject: "Conferma ricezione recesso" },
  en: { title: "LCS WITHDRAWAL RECEIPT", statement: "The customer hereby unequivocally communicates the decision to withdraw from the specified contract.", fullOrder: "Entire order", code: "Receipt code", submitted: "Submission date and time", customer: "Customer", email: "Email", order: "Order", items: "Items concerned", recipient: "Recipient", keep: "Keep this receipt as evidence that the withdrawal statement was submitted.", subject: "Withdrawal receipt confirmation" },
  fr: { title: "REÇU DE RÉTRACTATION LCS", statement: "Le client communique par la présente, sans équivoque, sa décision de se rétracter du contrat indiqué.", fullOrder: "Commande entière", code: "Code du reçu", submitted: "Date et heure d’envoi", customer: "Client", email: "E-mail", order: "Commande", items: "Articles concernés", recipient: "Destinataire", keep: "Conservez ce reçu comme preuve de la transmission de la déclaration de rétractation.", subject: "Confirmation de réception de la rétractation" },
  es: { title: "RECIBO DE DESISTIMIENTO LCS", statement: "El cliente comunica por la presente, de forma inequívoca, su decisión de desistir del contrato indicado.", fullOrder: "Pedido completo", code: "Código de recibo", submitted: "Fecha y hora de envío", customer: "Cliente", email: "Email", order: "Pedido", items: "Artículos afectados", recipient: "Destinatario", keep: "Conserva este recibo como prueba del envío de la declaración de desistimiento.", subject: "Confirmación de recepción del desistimiento" },
  de: { title: "LCS-WIDERRUFSBELEG", statement: "Der Kunde teilt hiermit eindeutig seine Entscheidung mit, den angegebenen Vertrag zu widerrufen.", fullOrder: "Gesamte Bestellung", code: "Belegnummer", submitted: "Datum und Uhrzeit der Übermittlung", customer: "Kunde", email: "E-Mail", order: "Bestellung", items: "Betroffene Artikel", recipient: "Empfänger", keep: "Bewahren Sie diesen Beleg als Nachweis für die Übermittlung der Widerrufserklärung auf.", subject: "Eingangsbestätigung des Widerrufs" },
};

export function buildWithdrawalReceipt(input: ReceiptInput) {
  const copy = labels[input.locale];
  return [
    copy.title,
    "=".repeat(copy.title.length),
    "",
    `${copy.code}: ${input.receiptCode}`,
    `${copy.submitted}: ${input.submittedAt}`,
    "",
    `${copy.customer}: ${input.customerName}`,
    `${copy.email}: ${input.email}`,
    `${copy.order}: ${input.orderNumber}`,
    `${copy.items}: ${input.itemsDescription || copy.fullOrder}`,
    "",
    copy.statement,
    "",
    `${copy.recipient}:`,
    "Ekobit SRL",
    "Via Firenze 185",
    "88900 Crotone (KR), Italia",
    "info@ekobit.it",
    "",
    copy.keep,
  ].join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export async function sendWithdrawalConfirmation(input: ReceiptInput, receiptText: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RETURNS_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `withdrawal/${input.receiptCode}`,
    },
    body: JSON.stringify({
      from,
      to: input.email,
      bcc: process.env.RETURNS_NOTIFICATION_EMAIL || "info@ekobit.it",
      reply_to: "info@ekobit.it",
      subject: `${labels[input.locale].subject} — ${input.receiptCode}`,
      text: receiptText,
      html: `<div style="background:#f2efe9;padding:40px 20px;color:#111210;font-family:Arial,sans-serif"><div style="max-width:640px;margin:0 auto;background:#fff;padding:36px"><p style="font-size:12px;letter-spacing:.16em">LCS / THE SELECTED EDIT</p><pre style="white-space:pre-wrap;font:15px/1.65 Georgia,serif">${escapeHtml(receiptText)}</pre></div></div>`,
    }),
  });

  return response.ok;
}
