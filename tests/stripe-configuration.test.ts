import assert from "node:assert/strict";
import test from "node:test";
import { getStripeConfiguration, resolveCheckoutOrigin } from "../lib/stripe-configuration";

const configured = { STRIPE_SECRET_KEY: "sk_test_example", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_example", STRIPE_WEBHOOK_SECRET: "whsec_example", NODE_ENV: "production" };

test("uses the canonical store domain when the optional site URL is missing", () => {
  const status = getStripeConfiguration(configured);
  assert.equal(status.configured, true);
  assert.equal(status.origin, "https://www.luxconceptstore.com");
  assert.equal(status.usesDefaultOrigin, true);
  assert.equal(resolveCheckoutOrigin({ NEXT_PUBLIC_SITE_URL: " https://shop.example/ ", NODE_ENV: "production" }), "https://shop.example");
});

test("identifies the missing public key without returning credentials", () => {
  const status = getStripeConfiguration({ ...configured, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: " " });
  assert.equal(status.configured, false);
  assert.deepEqual(status.missing, ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]);
  assert.deepEqual(status.invalid, []);
  for (const value of Object.values(configured).filter((value) => value !== "production")) assert.equal(JSON.stringify(status).includes(value), false);
});

test("rejects a mismatch between test and live keys", () => {
  const status = getStripeConfiguration({ ...configured, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_example" });
  assert.equal(status.configured, false);
  assert.equal(status.modeMismatch, true);
});

test("rejects incorrect credential types and tolerates pasted whitespace", () => {
  assert.equal(getStripeConfiguration(Object.fromEntries(Object.entries(configured).map(([key, value]) => [key, key === "NODE_ENV" ? value : ` ${value}\n`]))).configured, true);
  const status = getStripeConfiguration({ ...configured, STRIPE_WEBHOOK_SECRET: "sk_test_example", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "sk_test_example" });
  assert.equal(status.configured, false);
  assert.deepEqual(status.invalid, ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"]);
});

test("never silently replaces an invalid explicitly configured payment origin", () => {
  for (const origin of ["not-a-url", "http://shop.example", "https://user:password@shop.example", "https://shop.example/checkout", "https://shop.example/?x=1", "https://shop.example/#fragment"]) {
    const status = getStripeConfiguration({ ...configured, NEXT_PUBLIC_SITE_URL: origin });
    assert.equal(status.configured, false, origin);
    assert.deepEqual(status.invalid, ["NEXT_PUBLIC_SITE_URL"]);
    assert.equal(status.origin, null);
  }
  assert.equal(resolveCheckoutOrigin({ NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }), "http://localhost:3000");
  assert.throws(() => resolveCheckoutOrigin({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }));
});
