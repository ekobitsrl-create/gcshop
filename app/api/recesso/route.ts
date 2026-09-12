import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, withdrawalRequests } from "@/db/schema";
import { isLocale, type Locale } from "@/lib/i18n";
import { buildWithdrawalReceipt, sendWithdrawalConfirmation } from "@/lib/withdrawal-receipt";

export const dynamic = "force-dynamic";

type WithdrawalBody = {
  customerName?: unknown;
  email?: unknown;
  orderNumber?: unknown;
  items?: unknown;
  declarationAccepted?: unknown;
  website?: unknown;
  locale?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const errorMessages: Record<Locale, { invalid: string; unavailable: string }> = {
  it: { invalid: "Controlla i dati obbligatori e conferma la dichiarazione di recesso.", unavailable: "Non è stato possibile registrare la richiesta online. Puoi esercitare subito il recesso scrivendo a info@ekobit.it." },
  en: { invalid: "Check the required details and confirm the withdrawal statement.", unavailable: "The request could not be recorded online. You can exercise your right immediately by emailing info@ekobit.it." },
  fr: { invalid: "Vérifiez les données obligatoires et confirmez la déclaration de rétractation.", unavailable: "La demande n’a pas pu être enregistrée en ligne. Vous pouvez exercer immédiatement votre droit par e-mail à info@ekobit.it." },
  es: { invalid: "Comprueba los datos obligatorios y confirma la declaración de desistimiento.", unavailable: "No se pudo registrar la solicitud en línea. Puedes ejercer tu derecho inmediatamente escribiendo a info@ekobit.it." },
  de: { invalid: "Prüfen Sie die Pflichtangaben und bestätigen Sie die Widerrufserklärung.", unavailable: "Die Anfrage konnte online nicht erfasst werden. Sie können Ihr Recht sofort per E-Mail an info@ekobit.it ausüben." },
};

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function responseJson(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body: WithdrawalBody;
  try {
    body = await request.json() as WithdrawalBody;
  } catch {
    return responseJson({ error: errorMessages.it.invalid }, 400);
  }

  const locale: Locale = isLocale(body.locale) ? body.locale : "it";
  const customerName = readString(body.customerName, 160);
  const email = readString(body.email, 254).toLowerCase();
  const orderNumber = readString(body.orderNumber, 80).toUpperCase();
  const itemsDescription = readString(body.items, 1200) || null;
  const honeypot = readString(body.website, 200);

  if (honeypot) return responseJson({ error: errorMessages[locale].invalid }, 400);
  if (customerName.length < 2 || !emailPattern.test(email) || !orderNumber || body.declarationAccepted !== true) {
    return responseJson({ error: errorMessages[locale].invalid }, 400);
  }

  const db = getDb();
  const submittedAt = new Date().toISOString();
  const receiptCode = `LCS-${submittedAt.slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const declarationText = "Il consumatore dichiara in modo inequivocabile di voler recedere dal contratto identificato dal numero d’ordine indicato.";

  try {
    const matchingOrder = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.orderNumber, orderNumber), sql`lower(${orders.email}) = ${email}`))
      .limit(1);

    await db.insert(withdrawalRequests).values({
      id: crypto.randomUUID(),
      receiptCode,
      orderId: matchingOrder[0]?.id ?? null,
      orderNumber,
      customerName,
      email,
      itemsDescription,
      declarationText,
      locale,
      status: matchingOrder.length ? "submitted" : "submitted_unmatched",
      submittedAt,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    });

    const receiptInput = { receiptCode, submittedAt, customerName, email, orderNumber, itemsDescription, locale };
    const receiptText = buildWithdrawalReceipt(receiptInput);
    let emailSent = false;
    try {
      emailSent = await sendWithdrawalConfirmation(receiptInput, receiptText);
    } catch {
      // La ricevuta scaricabile resta disponibile anche se il servizio email è momentaneamente indisponibile.
    }

    if (emailSent) {
      await db.update(withdrawalRequests)
        .set({ confirmationSentAt: submittedAt, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(withdrawalRequests.receiptCode, receiptCode));
    }

    return responseJson({ receiptCode, receiptText, submittedAt, emailSent });
  } catch {
    return responseJson({ error: errorMessages[locale].unavailable }, 503);
  }
}
