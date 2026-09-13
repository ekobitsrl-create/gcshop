import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { stripeConfigured } from "@/lib/stripe";
import type { PaymentMethodCode } from "@/lib/stripe-checkout";

export type StorePaymentMethod = {
  code: PaymentMethodCode;
  name: string;
  provider: string;
  enabled: boolean;
  instructions: string;
  configured: boolean;
};

const defaults: StorePaymentMethod[] = [
  { code: "card", name: "Carta di credito o debito", provider: "stripe", enabled: true, instructions: "Paga con la tua carta in modo sicuro.", configured: false },
  {
    code: "paypal",
    name: "PayPal",
    provider: "paypal",
    enabled: true,
    instructions: "Paga in modo sicuro con il tuo conto PayPal o con una carta supportata.",
    configured: false,
  },
  {
    code: "bank_transfer",
    name: "Bonifico bancario",
    provider: "manual",
    enabled: true,
    instructions: "L’ordine viene preparato dopo la conferma dell’accredito.",
    configured: false,
  },
];

export async function getPaymentMethods(includeDisabled = false, db = getDb()): Promise<StorePaymentMethod[]> {
  const rows = await db
    .select()
    .from(paymentMethods)
    .orderBy(asc(paymentMethods.sortOrder));
  const source = rows.length
    ? rows.map((row) => ({
        code: row.code as StorePaymentMethod["code"],
        name: row.name,
        provider: row.provider,
        enabled: row.isEnabled,
        instructions: row.instructions ?? "",
        configured: false,
      }))
    : defaults;

  if (rows.length && !source.some((method) => method.code === "card")) {
    source.unshift({ ...defaults[0], enabled: source.some((method) => method.enabled && ["paypal", "bank_transfer"].includes(method.code)) });
  }
  return source
    .filter((method) => ["card", "paypal", "bank_transfer"].includes(method.code))
    .filter((method) => includeDisabled || method.enabled)
    .map((method) => ({
      ...method,
      provider: "stripe",
      configured: stripeConfigured(),
    }));
}

export function getBankTransferDetails() {
  const runtime = getRuntimeEnv();
  return {
    accountHolder: runtime.BANK_ACCOUNT_HOLDER ?? "Ekobit SRL",
    iban: runtime.BANK_IBAN ?? "",
    bic: runtime.BANK_BIC ?? "",
  };
}
