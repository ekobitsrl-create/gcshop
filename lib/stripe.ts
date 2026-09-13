import Stripe from "stripe";
import type { BankInstructions, PaymentMethodCode } from "@/lib/stripe-checkout";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_NOT_CONFIGURED");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 20000 });
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function checkoutOrigin() {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")) {
    throw new Error("INVALID_SITE_URL");
  }
  return url.origin;
}

export type StripeCheckoutState = {
  provider: "stripe";
  params: Stripe.Checkout.SessionCreateParams;
  sessionId?: string;
  customerId?: string;
  checkoutUrl?: string | null;
  refundedAmountCents?: number;
  inputFingerprint?: string;
};

export function readStripeState(value: string | null): StripeCheckoutState | null {
  try {
    const state = JSON.parse(value || "null");
    return state?.provider === "stripe" && state.params ? state : null;
  } catch {
    return null;
  }
}

export function readBankInstructions(session: Stripe.Checkout.Session): BankInstructions | null {
  const intent = typeof session.payment_intent === "object" ? session.payment_intent : null;
  const details = intent?.next_action?.display_bank_transfer_instructions;
  if (!details || session.payment_status === "paid") return null;
  const accounts = (details.financial_addresses ?? []).flatMap((address) => address.iban ? [{
    iban: address.iban.iban, bic: address.iban.bic, accountHolder: address.iban.account_holder_name,
  }] : []);
  return accounts.length ? { reference: details.reference ?? null, amountRemaining: details.amount_remaining ?? session.amount_total ?? 0, currency: details.currency ?? session.currency ?? "eur", accounts } : null;
}

export function buildCheckoutParams(input: {
  orderId: string; orderNumber: string; totalCents: number; currency: string;
  methods: PaymentMethodCode[]; origin: string; expiresAt: number; uiMode?: "custom";
  locale?: "it" | "en" | "fr" | "es" | "de";
}): Stripe.Checkout.SessionCreateParams {
  if (!Number.isSafeInteger(input.totalCents) || input.totalCents < 50) throw new Error("INVALID_PAYMENT_AMOUNT");
  if (input.currency.toLowerCase() !== "eur") throw new Error("UNSUPPORTED_CURRENCY");
  if (!input.methods.length || input.methods.some((method) => !["card", "paypal", "bank_transfer"].includes(method))) throw new Error("INVALID_PAYMENT_METHODS");
  const orderUrl = `${input.origin}/ordine/${encodeURIComponent(input.orderNumber)}`;
  return {
    mode: "payment",
    locale: input.locale ?? "auto",
    client_reference_id: input.orderId,
    metadata: { orderId: input.orderId },
    payment_intent_data: { metadata: { orderId: input.orderId } },
    payment_method_types: [...new Set(input.methods)].map((method) => method === "bank_transfer" ? "customer_balance" : method),
    ...(input.methods.includes("bank_transfer") ? {
      payment_method_options: { customer_balance: {
        funding_type: "bank_transfer",
        bank_transfer: { type: "eu_bank_transfer", eu_bank_transfer: { country: "DE" } },
      } },
    } : {}),
    line_items: [{ price_data: { currency: "eur", unit_amount: input.totalCents,
      product_data: { name: `Ordine ${input.orderNumber}`, description: "Articoli e sconti come da riepilogo ordine LCS. Spedizione inclusa." },
    }, quantity: 1 }],
    ...(input.uiMode === "custom" ? { ui_mode: "custom" as const, return_url: orderUrl } : { success_url: orderUrl, cancel_url: orderUrl }),
    expires_at: input.expiresAt,
  };
}
