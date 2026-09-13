export type StoreRuntimeEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  ADMIN_EMAILS?: string;
  PAYPAL_MODE?: "sandbox" | "live";
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  BANK_ACCOUNT_HOLDER?: string;
  BANK_IBAN?: string;
  BANK_BIC?: string;
};

export function getRuntimeEnv(): StoreRuntimeEnv {
  return process.env as StoreRuntimeEnv;
}
