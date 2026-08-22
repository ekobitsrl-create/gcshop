INSERT INTO "luxury"."products" (
  "id", "category_id", "name", "slug", "sku", "short_description", "description",
  "brand", "gender", "status", "base_price_cents", "currency", "is_featured", "metadata_json"
) VALUES
  (
    '21000000-0000-4000-8000-000000000015',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'giacche'),
    'Camicia-giacca Prada Re-Nylon nera',
    'prada-camicia-giacca-re-nylon-nera',
    'PRADA-GIA-001',
    'Camicia-giacca nera con bottoni a pressione e logo triangolare smaltato.',
    'Camicia-giacca nera in Re-Nylon con colletto classico, chiusura frontale a pressione e tasche integrate. Il logo triangolare smaltato firma il taschino sul petto. Taglia, vestibilità, imbottitura e riferimento esatto saranno verificati direttamente sul capo.',
    'Prada', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"SC514_1WQ8_F0002"}'
  ),
  (
    '21000000-0000-4000-8000-000000000016',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'cinture'),
    'Cintura Prada in pelle Saffiano con fibbia triangolare',
    'prada-cintura-saffiano-fibbia-triangolare',
    'PRADA-BEL-001',
    'Cintura nera in pelle Saffiano con fibbia triangolare in metallo e smalto.',
    'Cintura in pelle Saffiano nera completata da una fibbia triangolare con finitura metallica e dettaglio smaltato. Il design richiama il logo geometrico della maison. Misura, larghezza, finitura e condizioni saranno confermate sul prodotto.',
    'Prada', 'unisex', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"1CC621_053_F0002"}'
  ),
  (
    '21000000-0000-4000-8000-000000000017',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'giacche'),
    'Giacca Prada Re-Nylon con cappuccio',
    'prada-giacca-re-nylon-cappuccio-nera',
    'PRADA-GIA-002',
    'Giacca nera con cappuccio, zip frontale e logo triangolare smaltato.',
    'Giacca leggera nera in Re-Nylon con cappuccio, chiusura frontale con zip e taschino sul petto. Il logo triangolare smaltato completa il davanti. Composizione, vestibilità, taglia e codice esatto saranno verificati prima della vendita.',
    'Prada', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"SGC220_1WQ9_F0002"}'
  ),
  (
    '21000000-0000-4000-8000-000000000018',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'pantaloni'),
    'Jeans Prada a gamba ampia con effetto vernice',
    'prada-jeans-gamba-ampia-effetto-vernice',
    'PRADA-PAN-001',
    'Jeans blu a gamba ampia con schizzi bianchi e dettagli logo sul davanti.',
    'Jeans cinque tasche in denim blu lavato, con gamba ampia, schizzi bianchi effetto vernice e applicazioni grafiche Prada sul davanti. Modello, composizione, taglia, codice e autenticità dovranno essere verificati sul capo prima della vendita.',
    'Prada', 'unisex', 'active', 0, 'EUR', false,
    '{"pricePending":true,"verificationRequired":true,"reference":"paint-splatter-image-match"}'
  ),
  (
    '21000000-0000-4000-8000-000000000019',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'cinture'),
    'Cintura Prada in pelle con fibbia ovale incisa',
    'prada-cintura-pelle-fibbia-ovale-incisa',
    'PRADA-BEL-002',
    'Cintura nera in pelle con grande fibbia ovale incisa color argento.',
    'Cintura in pelle nera con una fibbia ovale in metallo dall''effetto anticato, decorata con logo e motivi incisi. La linea essenziale valorizza il dettaglio frontale. Misura, larghezza e condizioni saranno confermate direttamente sul prodotto.',
    'Prada', 'unisex', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"1CS130_X72_F0002"}'
  )
ON CONFLICT ("slug") DO UPDATE SET
  "category_id" = EXCLUDED."category_id",
  "name" = EXCLUDED."name",
  "sku" = EXCLUDED."sku",
  "short_description" = EXCLUDED."short_description",
  "description" = EXCLUDED."description",
  "brand" = EXCLUDED."brand",
  "gender" = EXCLUDED."gender",
  "status" = 'active',
  "base_price_cents" = 0,
  "currency" = 'EUR',
  "is_featured" = EXCLUDED."is_featured",
  "metadata_json" = EXCLUDED."metadata_json",
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."product_variants" (
  "id", "product_id", "sku", "title", "color", "size", "price_cents", "stock_quantity", "is_active"
) VALUES
  ('31000000-0000-4000-8000-000000000018', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-camicia-giacca-re-nylon-nera'), 'PRADA-GIA-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000019', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-cintura-saffiano-fibbia-triangolare'), 'PRADA-BEL-001-BLK', 'Nera · misura da definire', 'Nero e argento', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000020', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-giacca-re-nylon-cappuccio-nera'), 'PRADA-GIA-002-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000021', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-jeans-gamba-ampia-effetto-vernice'), 'PRADA-PAN-001-BLU', 'Blu · taglia da definire', 'Blu', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000022', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-cintura-pelle-fibbia-ovale-incisa'), 'PRADA-BEL-002-BLK', 'Nera · misura da definire', 'Nero e argento', NULL, NULL, 0, true)
ON CONFLICT ("sku") DO UPDATE SET
  "product_id" = EXCLUDED."product_id",
  "title" = EXCLUDED."title",
  "color" = EXCLUDED."color",
  "size" = EXCLUDED."size",
  "price_cents" = NULL,
  "stock_quantity" = 0,
  "is_active" = true,
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."product_images" ("id", "product_id", "url", "alt_text", "sort_order") VALUES
  ('51000000-0000-4000-8000-000000000015', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-camicia-giacca-re-nylon-nera'), '/images/catalog/prada-re-nylon-shirt-black.png', 'Camicia-giacca Prada Re-Nylon nera', 0),
  ('51000000-0000-4000-8000-000000000016', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-cintura-saffiano-fibbia-triangolare'), '/images/catalog/prada-saffiano-triangle-belt-black.png', 'Cintura Prada nera con fibbia triangolare', 0),
  ('51000000-0000-4000-8000-000000000017', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-giacca-re-nylon-cappuccio-nera'), '/images/catalog/prada-re-nylon-hooded-jacket-black.png', 'Giacca Prada Re-Nylon nera con cappuccio', 0),
  ('51000000-0000-4000-8000-000000000018', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-jeans-gamba-ampia-effetto-vernice'), '/images/catalog/prada-logo-patch-wide-leg-jeans.png', 'Jeans Prada blu a gamba ampia con effetto vernice', 0),
  ('51000000-0000-4000-8000-000000000019', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'prada-cintura-pelle-fibbia-ovale-incisa'), '/images/catalog/prada-oval-buckle-leather-belt-black.png', 'Cintura Prada nera con fibbia ovale incisa', 0)
ON CONFLICT ("id") DO UPDATE SET
  "product_id" = EXCLUDED."product_id",
  "url" = EXCLUDED."url",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;
