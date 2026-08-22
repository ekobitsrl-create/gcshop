import { getRuntimeEnv } from "@/lib/runtime-env";

type PayPalLink = { href: string; rel: string; method: string };

function paypalBaseUrl() {
  return getRuntimeEnv().PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken(): Promise<string> {
  const runtime = getRuntimeEnv();
  if (!runtime.PAYPAL_CLIENT_ID || !runtime.PAYPAL_CLIENT_SECRET) {
    throw new Error("PAYPAL_NOT_CONFIGURED");
  }

  const credentials = btoa(`${runtime.PAYPAL_CLIENT_ID}:${runtime.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) throw new Error("PAYPAL_AUTH_FAILED");
  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("PAYPAL_AUTH_FAILED");
  return payload.access_token;
}

export async function createPayPalOrder(input: {
  reference: string;
  amountCents: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": input.reference,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.reference,
          custom_id: input.reference,
          amount: {
            currency_code: input.currency,
            value: (input.amountCents / 100).toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Lusso Concept Store",
            locale: "it-IT",
            user_action: "PAY_NOW",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    }),
  });

  const payload = (await response.json()) as {
    id?: string;
    status?: string;
    links?: PayPalLink[];
    details?: Array<{ description?: string }>;
  };
  if (!response.ok || !payload.id) {
    throw new Error(payload.details?.[0]?.description ?? "PAYPAL_CREATE_FAILED");
  }

  return {
    id: payload.id,
    status: payload.status ?? "CREATED",
    approveUrl: payload.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href,
    raw: payload,
  };
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  const payload = (await response.json()) as { id?: string; status?: string; details?: Array<{ description?: string }> };
  if (!response.ok || payload.status !== "COMPLETED") {
    throw new Error(payload.details?.[0]?.description ?? "PAYPAL_CAPTURE_FAILED");
  }
  return payload;
}
