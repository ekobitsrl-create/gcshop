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
  assert.equal(migrationFiles.length, 5);
  const [schemaMigration, catalogMigration, feedMigration, translationMigration, schema, checkout, coupon, paypal, admin, header, checkoutUi, i18n] = await Promise.all([
    readFile(new URL(`../drizzle/${migrationFiles[0]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[1]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[2]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[4]}`, import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/coupon/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/payments/paypal/capture/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/products/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/checkout-form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8"),
  ]);
  assert.equal((schemaMigration.match(/CREATE TABLE/g) ?? []).length, 17);
  assert.match(schemaMigration, /CREATE SCHEMA IF NOT EXISTS "luxury"/);
  assert.doesNotMatch(schemaMigration, /^INSERT\s/gim);
  assert.match(catalogMigration, /first_order_only/);
  assert.match(catalogMigration, /WELCOME10/);
  assert.equal((catalogMigration.match(/"placeholder":true/g) ?? []).length, 6);
  assert.match(feedMigration, /catalog_imports/);
  assert.match(feedMigration, /shipments/);
  assert.match(feedMigration, /supplier_stock_quantity/);
  assert.match(translationMigration, /product_translations/);
  assert.match(schema, /pgSchema\("luxury"\)/);
  assert.match(schema, /firstOrderOnly/);
  assert.match(checkout, /bank_transfer/);
  assert.match(checkout, /createPayPalOrder/);
  assert.match(checkout, /discountCents/);
  assert.match(coupon, /evaluateCoupon/);
  assert.match(paypal, /capturePayPalOrder/);
  assert.match(admin, /recordAdminAction/);
  assert.match(i18n, /Spedizione gratuita su tutti gli ordini/);
  assert.match(i18n, /Accesso alla selezione privata/);
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
  await assert.rejects(access(new URL("../app/try-on/page.tsx", import.meta.url)));
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app\/_sites-preview", templateRoot)));
});

test("keeps Try-On out of the public storefront", async () => {
  const [shop, product, sitemap, commerceCss] = await Promise.all([
    readFile(new URL("../app/shop/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/commerce.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(`${shop}\n${product}\n${sitemap}\n${commerceCss}`, /try-on|tryon|Virtual Try-On|AR preview/i);
  await assert.rejects(access(new URL("../app/try-on/page.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/try-on/try-on.css", import.meta.url)));
});

test("keeps purchase actions immediate", async () => {
  const [home, purchase, product] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(home, /\/shop\?categoria=donna/);
  assert.match(home, /\/shop\?categoria=uomo/);
  assert.match(purchase, /purchase\.buyNow/);
  assert.match(purchase, /window\.location\.assign\("\/checkout"\)/);
  assert.match(product, /<ProductPurchase/);
  assert.doesNotMatch(product, /try-on|tryon|Virtual Try-On|AR preview/i);
});

test("adds a restrained trust signal and catalog-driven SEO", async () => {
  const [home, header, footer, product, sitemap, robots, i18n] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8"),
  ]);

  assert.match(i18n, /Provenienza e autenticità/);
  assert.match(i18n, /Non promettiamo ciò che non possiamo documentare/);
  assert.match(i18n, /provenienza commerciale, condizioni e composizione/);
  assert.match(footer, /\/#provenienza/);
  assert.match(header, /<strong>LCS<\/strong>/);
  assert.doesNotMatch(`${home}\n${header}\n${footer}`, /Luxury Concept Store|WELCOME10/i);
  assert.match(product, /generateMetadata/);
  assert.match(product, /product\.brand/);
  assert.match(sitemap, /products\.status/);
  assert.match(sitemap, /informazioni-societarie/);
  assert.match(robots, /\/admin\//);
  assert.match(sitemap, /https:\/\/lcsedit\.vercel\.app/);
  assert.match(robots, /https:\/\/lcsedit\.vercel\.app/);
});

test("derives Romanelli selling prices from supplier cost plus 100 percent", async () => {
  const [importer, adminApi, adminUi] = await Promise.all([
    readFile(new URL("../scripts/import-romanelli.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/products/[id]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/admin-products.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(importer, /SELLING_PRICE_MULTIPLIER = 2/);
  assert.match(importer, /supplier_cost_plus_100_percent/);
  assert.match(importer, /costPriceCents \* SELLING_PRICE_MULTIPLIER/);
  assert.match(importer, /variantCost \* SELLING_PRICE_MULTIPLIER/);
  assert.match(adminApi, /supplierCostCents \* 2/);
  assert.match(adminUi, /Costo × 2/);
  assert.match(adminUi, /Ricarico/);
});

test("uses carrello consistently for the shopping flow", async () => {
  const files = await Promise.all([
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/checkout/coupon/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/coupons.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8"),
  ]);
  const commerceCopy = files.join("\n");

  assert.match(commerceCopy, /Aggiungi al carrello/);
  assert.match(commerceCopy, /header\.cartLabel/);
  assert.match(commerceCopy, /Carrello, \{count\} articoli/);
  assert.match(commerceCopy, /Il carrello è vuoto/);
  assert.doesNotMatch(commerceCopy, /Aggiungi alla borsa|articoli nella borsa|La borsa è vuota|totale della borsa|Borsa, \$\{cartCount\}/i);
});

test("localizes the storefront and persists product translations", async () => {
  const [i18n, server, selector, localeRoute, schema, translator, shop, product, checkout] = await Promise.all([
    readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/i18n-server.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/language-selector.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/locale/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/translate-catalog.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/shop/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/checkout-form.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(i18n, /\["it", "en", "fr", "es", "de"\]/);
  for (const label of ["English", "Français", "Español", "Deutsch"]) assert.match(i18n, new RegExp(label));
  assert.match(server, /lcs_locale/);
  assert.match(selector, /api\/locale/);
  assert.match(localeRoute, /maxAge: 60 \* 60 \* 24 \* 365/);
  assert.match(schema, /productTranslations/);
  assert.match(translator, /translate\.googleapis\.com/);
  assert.match(translator, /on conflict \(product_id, locale\)/);
  assert.match(shop, /productTranslations\.name/);
  assert.match(product, /productTranslations/);
  assert.match(checkout, /useI18n/);
});

test("publishes a variant-level Google Merchant RSS feed", async () => {
  const [route, feed, product, purchase] = await Promise.all([
    readFile(new URL("../app/feeds/google-merchant.xml/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/google-merchant.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(route, /application\/xml; charset=utf-8/);
  assert.match(route, /s-maxage=1800/);
  assert.match(route, /new ReadableStream/);
  assert.match(route, /Response\.redirect\(canonicalFeedUrl, 307\)/);
  assert.match(feed, /xmlns:g=\"http:\/\/base\.google\.com\/ns\/1\.0\"/);
  for (const attribute of ["g:id", "g:image_link", "g:availability", "g:condition", "g:price", "g:brand", "g:item_group_id", "g:color", "g:size", "g:gender", "g:age_group", "g:product_type", "g:google_product_category"]) {
    assert.match(feed, new RegExp(attribute));
  }
  assert.match(feed, /g:variant_option/);
  assert.match(feed, /normalizeGtin/);
  assert.match(product, /searchParams/);
  assert.match(product, /defaultVariantId=\{requestedVariant\?\.id\}/);
  assert.match(purchase, /window\.history\.replaceState/);
});
