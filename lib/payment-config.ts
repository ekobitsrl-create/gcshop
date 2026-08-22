import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getRuntimeEnv } from "@/lib/runtime-env";

export type StorePaymentMethod = {
  code: "paypal" | "bank_transfer";
  name: string;
  provider: string;
  enabled: boolean;
  instructions: string;
  configured: boolean;
};

const defaults: StorePaymentMethod[] = [
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

export async function getPaymentMethods(): Promise<StorePaymentMethod[]> {
  const rows = await getDb()
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.isEnabled, true))
    .orderBy(asc(paymentMethods.sortOrder));
  const runtime = getRuntimeEnv();
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

  return source
    .filter((method) => method.code === "paypal" || method.code === "bank_transfer")
    .map((method) => ({
      ...method,
      configured:
        method.code === "paypal"
          ? Boolean(runtime.PAYPAL_CLIENT_ID && runtime.PAYPAL_CLIENT_SECRET)
          : Boolean(runtime.BANK_ACCOUNT_HOLDER && runtime.BANK_IBAN),
    }));
}

export function getBankTransferDetails() {
  const runtime = getRuntimeEnv();
  return {
    accountHolder: runtime.BANK_ACCOUNT_HOLDER ?? "",
    iban: runtime.BANK_IBAN ?? "",
    bic: runtime.BANK_BIC ?? "",
  };
}
