import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("contains the Luxury Concept Store identity and company details", async () => {
  const [page, layout, footer] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-footer.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Luxury Concept Store \| Moda contemporanea selezionata/i);
  assert.match(page, /Il lusso/);
  assert.match(page, /Luxury Concept Store/);
  assert.match(footer, /Ekobit SRL/);
  assert.match(footer, /02424510796/);
  assert.match(footer, /Via Firenze 185/);
  assert.match(footer, /338 134 6675/);
  assert.match(footer, /info@ekobit\.it/);
  assert.doesNotMatch(page, /InStyleShop|instyleshop|codex-preview|Building your site/i);
});

test("ships an empty ecommerce migration and all critical flows", async () => {
  const migrationFiles = (await readdir(new URL("../drizzle/", import.meta.url))).filter((file) => file.endsWith(".sql"));
  assert.equal(migrationFiles.length, 1);
  const [migration, schema, checkout, paypal, admin] = await Promise.all([
    readFile(new URL(`../drizzle/${migrationFiles[0]}`, import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/payments/paypal/capture/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/products/route.ts", import.meta.url), "utf8"),
  ]);
  assert.equal((migration.match(/CREATE TABLE/g) ?? []).length, 17);
  assert.match(migration, /CREATE SCHEMA IF NOT EXISTS "luxury"/);
  assert.doesNotMatch(migration, /^INSERT\s/gim);
  assert.match(schema, /pgSchema\("luxury"\)/);
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
  assert.match(layout, /og-v2\.png/);
  await access(new URL("../public/og-v2.png", import.meta.url));
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app\/_sites-preview", templateRoot)));
});
