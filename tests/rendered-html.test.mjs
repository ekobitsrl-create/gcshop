import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("keeps the LCS home editorial and moves company details to the legal page", async () => {
  const [page, layout, footer, header, company] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/informazioni-societarie/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /LCS \| The Selected Edit/i);
  assert.match(page, /LCS/);
  assert.doesNotMatch(`${page}\n${header}\n${footer}\n${layout}`, /Ekobit|Virtual Try-On|Try-On|\bAR\b|tecnolog|fitting/i);
  assert.match(company, /Ekobit SRL/);
  assert.match(company, /02424510796/);
  assert.match(company, /Via Firenze 185/);
  assert.match(company, /338 134 6675/);
  assert.match(company, /info@ekobit\.it/);
  assert.doesNotMatch(page, /InStyleShop|instyleshop|codex-preview|Building your site/i);
});

test("ships the ecommerce schema, placeholder catalog and all critical flows", async () => {
  const migrationFiles = (await readdir(new URL("../drizzle/", import.meta.url))).filter((file) => file.endsWith(".sql"));
  assert.equal(migrationFiles.length, 2);
  const [schemaMigration, catalogMigration, schema, checkout, coupon, paypal, admin, header, checkoutUi] = await Promise.all([
    readFile(new URL(`../drizzle/${migrationFiles[0]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[1]}`, import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/coupon/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/payments/paypal/capture/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/products/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/checkout-form.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal((schemaMigration.match(/CREATE TABLE/g) ?? []).length, 17);
  assert.match(schemaMigration, /CREATE SCHEMA IF NOT EXISTS "luxury"/);
  assert.doesNotMatch(schemaMigration, /^INSERT\s/gim);
  assert.match(catalogMigration, /first_order_only/);
  assert.match(catalogMigration, /WELCOME10/);
  assert.equal((catalogMigration.match(/"placeholder":true/g) ?? []).length, 6);
  assert.match(schema, /pgSchema\("luxury"\)/);
  assert.match(schema, /firstOrderOnly/);
  assert.match(checkout, /bank_transfer/);
  assert.match(checkout, /createPayPalOrder/);
  assert.match(checkout, /discountCents/);
  assert.match(coupon, /evaluateCoupon/);
  assert.match(paypal, /capturePayPalOrder/);
  assert.match(admin, /recordAdminAction/);
  assert.match(header, /Spedizione gratuita su tutti gli ordini/);
  assert.match(header, /Accesso alla selezione privata/);
  assert.doesNotMatch(header, /WELCOME10|10% sul primo ordine/);
  assert.match(checkoutUi, /WELCOME10/);
  assert.doesNotMatch(header, /Crotone|Client service/i);
});

test("removes the disposable starter preview", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /LCS/);
  assert.match(layout, /og-lcs\.png/);
  await access(new URL("../public/og-lcs.png", import.meta.url));
  await access(new URL("../app/try-on/page.tsx", import.meta.url));
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app\/_sites-preview", templateRoot)));
});

test("ships the webcam-first Virtual Try-On project without photo uploads", async () => {
  const [page, shop, product] = await Promise.all([
    readFile(new URL("../app/try-on/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/shop/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Virtual Try-On/i);
  assert.match(page, /Non immaginarlo|specchio AR/i);
  assert.match(page, /niente foto da caricare|nessuna foto da caricare/i);
  assert.doesNotMatch(page, /type="file"|readAsDataURL|Carica la tua foto/i);
  assert.match(shop, /product-card-tryon/);
  assert.match(product, /product-tryon-cta/);
});

test("keeps purchase actions ahead of the AR story", async () => {
  const [home, purchase, product, tryOn] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/try-on/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(home, /\/shop\?categoria=donna/);
  assert.match(home, /\/shop\?categoria=uomo/);
  assert.match(purchase, /Acquista ora/);
  assert.match(purchase, /window\.location\.assign\("\/checkout"\)/);
  assert.ok(product.indexOf("<ProductPurchase") < product.indexOf("product-tryon-cta"));
  assert.match(tryOn, /\/prodotto\/\$\{look\.slug\}/);
});

test("adds a restrained trust signal and catalog-driven SEO", async () => {
  const [home, header, footer, product, sitemap, robots] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
  ]);

  assert.match(home, /Provenienza e autenticità/);
  assert.match(home, /Non promettiamo ciò che non possiamo documentare/);
  assert.match(home, /provenienza commerciale, condizioni e composizione/);
  assert.match(footer, /\/#provenienza/);
  assert.match(header, /<strong>LCS<\/strong>/);
  assert.doesNotMatch(`${home}\n${header}\n${footer}`, /Luxury Concept Store|WELCOME10/i);
  assert.match(product, /generateMetadata/);
  assert.match(product, /product\.brand/);
  assert.match(sitemap, /products\.status/);
  assert.match(sitemap, /informazioni-societarie/);
  assert.match(robots, /\/admin\//);
});
