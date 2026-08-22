import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("ships a restrained ecommerce home and keeps company details on the legal page", async () => {
  const [page, layout, footer, header, company, catalog] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/store-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/informazioni-societarie/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Lusso,/);
  assert.match(page, /Trova subito quello che cerchi/);
  assert.match(page, /Prezzo da definire/);
  assert.match(header, /catalogCategories/);
  assert.match(header, /Spedizione gratuita/);
  assert.match(header, /Pagamenti sicuri/);
  assert.match(catalog, /name: "T-shirt"/);
  assert.match(catalog, /name: "Cinture"/);
  assert.match(catalog, /name: "Felpe e cardigan"/);
  assert.match(catalog, /name: "Pantaloni"/);
  assert.match(catalog, /name: "Camicie e polo"/);
  assert.match(catalog, /name: "Giacche"/);
  assert.match(footer, /Tutti i prodotti/);
  assert.match(layout, /Lusso Concept Store \| Abbigliamento e accessori/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(`${page}\n${header}\n${footer}`, /Scelto\.\s*Non esibito|Shop by attitude|Objects of desire|The edit|Try-On|AR preview/i);
  assert.match(company, /Dati in aggiornamento/);
  assert.doesNotMatch(company, /Ekobit|02424510796|Via Firenze 185|info@ekobit/);
});

test("keeps the full commerce schema and expands the pending-price catalog to nineteen items", async () => {
  const migrationFiles = (await readdir(new URL("../drizzle/", import.meta.url)))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  assert.equal(migrationFiles.length, 6);

  const [schemaMigration, originalCatalog, refreshedCatalog, expandedCatalog, pradaCatalog, stripeCheckout, placeholderCatalog, schema, journal] = await Promise.all([
    readFile(new URL(`../drizzle/${migrationFiles[0]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[1]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[2]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[3]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[4]}`, import.meta.url), "utf8"),
    readFile(new URL(`../drizzle/${migrationFiles[5]}`, import.meta.url), "utf8"),
    readFile(new URL("../lib/placeholder-products.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"),
  ]);

  assert.equal((schemaMigration.match(/CREATE TABLE/g) ?? []).length, 17);
  assert.match(schemaMigration, /CREATE SCHEMA IF NOT EXISTS "luxury"/);
  assert.match(originalCatalog, /WELCOME10/);
  assert.match(refreshedCatalog, /T-shirt Christian Dior Couture dalla vestibilità comoda/);
  assert.match(refreshedCatalog, /Cintura in pelle avorio con fibbia rotonda Interlocking G/);
  assert.match(refreshedCatalog, /Cardigan reversibile con cappuccio Dior Oblique/);
  assert.match(refreshedCatalog, /'t-shirt'/);
  assert.match(refreshedCatalog, /'cinture'/);
  assert.match(refreshedCatalog, /'felpe-e-cardigan'/);
  assert.match(expandedCatalog, /Jeans cargo Dior in twill di cotone blu/);
  assert.match(expandedCatalog, /Camicia bowling Gucci in seta jacquard GG nera/);
  assert.match(expandedCatalog, /Pantaloni tuta Balenciaga Loop Sports Icon/);
  assert.match(expandedCatalog, /Giacca tuta Balenciaga Soccer nera/);
  assert.match(expandedCatalog, /Cintura Burberry reversibile in pelle con fibbia TB/);
  assert.match(expandedCatalog, /'pantaloni'/);
  assert.match(expandedCatalog, /'camicie-e-polo'/);
  assert.match(expandedCatalog, /'giacche'/);
  assert.match(pradaCatalog, /Camicia-giacca Prada Re-Nylon nera/);
  assert.match(pradaCatalog, /Cintura Prada in pelle Saffiano con fibbia triangolare/);
  assert.match(pradaCatalog, /Giacca Prada Re-Nylon con cappuccio/);
  assert.match(pradaCatalog, /Jeans Prada a gamba ampia con effetto vernice/);
  assert.match(pradaCatalog, /Cintura Prada in pelle con fibbia ovale incisa/);
  assert.match(stripeCheckout, /'stripe'/);
  assert.equal((refreshedCatalog.match(/"pricePending":true/g) ?? []).length, 3);
  assert.equal((expandedCatalog.match(/"pricePending":true/g) ?? []).length, 11);
  assert.equal((pradaCatalog.match(/"pricePending":true/g) ?? []).length, 5);
  assert.equal((placeholderCatalog.match(/price: 0/g) ?? []).length, 19);
  assert.equal((refreshedCatalog.match(/"stock_quantity" = 0/g) ?? []).length, 1);
  assert.equal((expandedCatalog.match(/"stock_quantity" = 0/g) ?? []).length, 1);
  assert.match(refreshedCatalog, /"base_price_cents" = 0/);
  assert.match(expandedCatalog, /"base_price_cents" = 0/);
  assert.match(pradaCatalog, /"base_price_cents" = 0/);
  assert.match(schema, /pgSchema\("luxury"\)/);
  assert.match(journal, /0002_gentle_catalog_refresh/);
  assert.match(journal, /0003_catalog_expansion/);
  assert.match(journal, /0004_prada_catalog/);
  assert.match(journal, /0005_stripe_checkout/);
});

test("includes the supplied product images and refreshed social card", async () => {
  await Promise.all([
    access(new URL("../public/images/catalog/dior-tshirt-christian-dior-couture.png", import.meta.url)),
    access(new URL("../public/images/catalog/gucci-cintura-interlocking-g.png", import.meta.url)),
    access(new URL("../public/images/catalog/dior-cardigan-oblique.png", import.meta.url)),
    access(new URL("../public/images/catalog/dior-cargo-jeans-blue.png", import.meta.url)),
    access(new URL("../public/images/catalog/gucci-gg-silk-jacquard-bowling-shirt-black.png", import.meta.url)),
    access(new URL("../public/images/catalog/gucci-gg-canvas-bowling-shirt-beige.png", import.meta.url)),
    access(new URL("../public/images/catalog/gucci-logo-embroidered-tshirt.png", import.meta.url)),
    access(new URL("../public/images/catalog/balenciaga-distorted-logo-tshirt-black.png", import.meta.url)),
    access(new URL("../public/images/catalog/balenciaga-loop-sports-icon-track-pants.png", import.meta.url)),
    access(new URL("../public/images/catalog/balenciaga-flipped-uni-zip-hoodie.png", import.meta.url)),
    access(new URL("../public/images/catalog/balenciaga-soccer-tracksuit-jacket.png", import.meta.url)),
    access(new URL("../public/images/catalog/burberry-icon-stripe-polo.png", import.meta.url)),
    access(new URL("../public/images/catalog/burberry-check-hooded-jacket.png", import.meta.url)),
    access(new URL("../public/images/catalog/burberry-tb-belt.png", import.meta.url)),
    access(new URL("../public/images/catalog/prada-re-nylon-shirt-black.png", import.meta.url)),
    access(new URL("../public/images/catalog/prada-saffiano-triangle-belt-black.png", import.meta.url)),
    access(new URL("../public/images/catalog/prada-re-nylon-hooded-jacket-black.png", import.meta.url)),
    access(new URL("../public/images/catalog/prada-logo-patch-wide-leg-jeans.png", import.meta.url)),
    access(new URL("../public/images/catalog/prada-oval-buckle-leather-belt-black.png", import.meta.url)),
    access(new URL("../public/images/lusso-concept-store-hero.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/og-editorial-legacy.png", import.meta.url)),
  ]);
});

test("shows pending prices without exposing zero-value purchase actions", async () => {
  const [shop, product, purchase, utils, admin] = await Promise.all([
    readFile(new URL("../app/shop/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/store-utils.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/admin-products.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(shop, /formatProductPrice/);
  assert.doesNotMatch(shop, /product-card-tryon|AR preview/i);
  assert.match(product, /product\.basePriceCents > 0/);
  assert.match(product, /Prezzo in aggiornamento/);
  assert.doesNotMatch(product, /product-tryon-cta|Try-On AR/i);
  assert.match(utils, /Prezzo da definire/);
  assert.match(admin, /formatProductPrice/);
  assert.match(purchase, /Acquista ora/);
  assert.match(purchase, /window\.location\.assign\("\/checkout"\)/);
});

test("keeps catalog-driven product SEO and updates category routes", async () => {
  const [product, sitemap, robots, catalog] = await Promise.all([
    readFile(new URL("../app/prodotto/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8"),
  ]);

  assert.match(product, /generateMetadata/);
  assert.match(product, /twitter/);
  assert.match(product, /new URL\(primaryImage\.url, requestSiteUrl\)/);
  assert.match(sitemap, /catalogCategories\.map/);
  assert.match(catalog, /slug: "t-shirt"/);
  assert.match(catalog, /slug: "cinture"/);
  assert.match(catalog, /slug: "felpe-e-cardigan"/);
  assert.match(catalog, /slug: "pantaloni"/);
  assert.match(catalog, /slug: "camicie-e-polo"/);
  assert.match(catalog, /slug: "giacche"/);
  assert.doesNotMatch(sitemap, /categoria=donna|categoria=uomo|categoria=accessori/);
  assert.match(robots, /\/admin\//);
});

test("removes the disposable starter preview", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
});
