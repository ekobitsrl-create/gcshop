import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("contains the Luxury Concept Store identity and company details", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Luxury Concept Store \| Moda contemporanea selezionata/i);
  assert.match(page, /Il lusso,/);
  assert.match(page, /Luxury Concept Store/);
  assert.match(page, /Ekobit SRL/);
  assert.match(page, /02424510796/);
  assert.match(page, /Via Firenze 185/);
  assert.match(page, /338 134 6675/);
  assert.match(page, /info@ekobit\.it/);
  assert.doesNotMatch(page, /InStyleShop|instyleshop|codex-preview|Building your site/i);
});

test("ships an empty ecommerce migration and all critical flows", async () => {
  const [migration, hosting, checkout, paypal, admin] = await Promise.all([
    readFile(new URL("../drizzle/0000_spotty_unicorn.sql", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/payments/paypal/capture/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/products/route.ts", import.meta.url), "utf8"),
  ]);
  assert.equal((migration.match(/CREATE TABLE/g) ?? []).length, 17);
  assert.doesNotMatch(migration, /^INSERT\s/gim);
  assert.match(hosting, /"d1"\s*:\s*"DB"/);
  assert.match(checkout, /bank_transfer/);
  assert.match(checkout, /createPayPalOrder/);
  assert.match(paypal, /capturePayPalOrder/);
  assert.match(admin, /recordAdminAction/);
});

test("removes the disposable starter preview", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Luxury Concept Store/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app\/_sites-preview", templateRoot)));
});
