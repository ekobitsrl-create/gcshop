export type PaymentMethodCode = "card" | "paypal" | "bank_transfer";

export type CheckoutLaunch =
  | { type: "redirect"; redirectUrl: string }
  | { type: "custom"; clientSecret: string; orderUrl: string; totalCents: number; currency: string; paymentMethodId?: string };

export type BankInstructions = {
  reference: string | null; amountRemaining: number; currency: string;
  accounts: Array<{ iban: string; bic: string; accountHolder: string }>;
};
