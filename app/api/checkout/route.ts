import { cookies } from "next/headers";
import { getPaymentMethods } from "@/lib/payment-config";
import { checkoutOrigin, getStripe } from "@/lib/stripe";
import { getDb } from "@/db";
import { getRequestLocale } from "@/lib/i18n-server";
import { CheckoutError, parseCheckoutInput, reserveStripeOrder, startStripeCheckout } from "@/lib/stripe-orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("lcs_cart")?.value;
    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) throw new CheckoutError("Il carrello è vuoto.");
    const body = await request.json();
    const input = parseCheckoutInput(body);
    const methods = (await getPaymentMethods()).filter((item) => item.configured).map((item) => item.code);
    if (!methods.length) throw new CheckoutError("Metodo di pagamento non disponibile.", 503);
    if (!methods.includes(body.paymentMethod)) throw new CheckoutError("Scegli un metodo di pagamento disponibile.");
    const transactionId = await reserveStripeOrder(token, input, checkoutOrigin(), getDb(), { methods, locale: await getRequestLocale(), uiMode: "custom" });
    const launch = await startStripeCheckout(transactionId);
    if (launch.type === "custom" && body.paymentMethod === "bank_transfer") {
      // Bank transfer has no sensitive client input; create its PaymentMethod on the server.
      const method = await getStripe().paymentMethods.create({ type: "customer_balance", billing_details: {
        name: `${input.firstName} ${input.lastName}`, email: input.email, phone: input.phone,
        address: { line1: input.addressLine1, postal_code: input.postalCode, city: input.city, state: input.province, country: input.countryCode },
      } }, { idempotencyKey: `bank-method:${transactionId}` });
      launch.paymentMethodId = method.id;
    }
    return Response.json(launch, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof CheckoutError) return Response.json({ error: error.message, orderUrl: error.orderUrl }, { status: error.status });
    if (error instanceof SyntaxError) return Response.json({ error: "Dati non validi." }, { status: 400 });
    console.error("Stripe checkout failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Pagamento temporaneamente non disponibile. Riprova: il tuo ordine non verrà duplicato." }, { status: 502 });
  }
}
