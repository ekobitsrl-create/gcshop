UPDATE "luxury"."products"
SET "status" = 'draft',
    "metadata_json" = '{"placeholder":true,"archived":true}',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "metadata_json" = '{"placeholder":true}';--> statement-breakpoint

UPDATE "luxury"."categories" AS "category"
SET "is_active" = false,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "category"."slug" IN ('donna', 'uomo', 'accessori')
  AND NOT EXISTS (
    SELECT 1
    FROM "luxury"."products" AS "product"
    WHERE "product"."category_id" = "category"."id"
      AND "product"."status" = 'active'
  );--> statement-breakpoint

INSERT INTO "luxury"."categories" ("id", "name", "slug", "description", "sort_order", "is_active") VALUES
  ('11000000-0000-4000-8000-000000000001', 'T-shirt', 't-shirt', 'T-shirt e maglie leggere.', 10, true),
  ('11000000-0000-4000-8000-000000000002', 'Cinture', 'cinture', 'Cinture e accessori da vita.', 20, true),
  ('11000000-0000-4000-8000-000000000003', 'Felpe e cardigan', 'felpe-e-cardigan', 'Felpe, cardigan e capi con zip.', 30, true)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = true,
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."products" (
  "id", "category_id", "name", "slug", "sku", "short_description", "description",
  "brand", "gender", "status", "base_price_cents", "currency", "is_featured", "metadata_json"
) VALUES
  (
    '21000000-0000-4000-8000-000000000001',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 't-shirt'),
    'T-shirt Christian Dior Couture dalla vestibilità comoda',
    'dior-t-shirt-christian-dior-couture',
    'DIOR-TSH-001',
    'T-shirt girocollo con firma Christian Dior Couture sul petto.',
    'Modello dalla vestibilità comoda, proposto nelle varianti bianca e nera. Il girocollo essenziale e la firma Christian Dior Couture sul davanti definiscono un capo quotidiano facile da abbinare. Composizione, taglie e condizioni saranno verificate prima della pubblicazione definitiva.',
    'Dior', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"343J696C0554"}'
  ),
  (
    '21000000-0000-4000-8000-000000000002',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'cinture'),
    'Cintura in pelle avorio con fibbia rotonda Interlocking G',
    'gucci-cintura-interlocking-g-in-pelle-avorio',
    'GUCCI-BEL-001',
    'Cintura color avorio con fibbia rotonda Interlocking G.',
    'Una cintura in tonalità avorio dalla linea pulita, completata da una fibbia rotonda con dettaglio Interlocking G. Pensata per essere indossata in vita o sui fianchi. Materiali, misura e finiture esatte saranno verificati sul prodotto prima della vendita.',
    'Gucci', 'donna', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"round-interlocking-g"}'
  ),
  (
    '21000000-0000-4000-8000-000000000003',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'felpe-e-cardigan'),
    'Cardigan reversibile con cappuccio Dior Oblique',
    'dior-cardigan-reversibile-cappuccio-oblique',
    'DIOR-CAR-001',
    'Cardigan grigio reversibile con cappuccio e motivo Dior Oblique.',
    'Cardigan con cappuccio, chiusura frontale con zip e finiture a costine. Il modello reversibile alterna un lato grigio essenziale e un lato con motivo Dior Oblique all-over. Composizione, taglie e condizioni saranno confermate prima della pubblicazione definitiva.',
    'Dior', 'donna', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"544G12A0551_X8890"}'
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
  ('31000000-0000-4000-8000-000000000001', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-t-shirt-christian-dior-couture'), 'DIOR-TSH-001-WHT', 'Bianca · taglia da definire', 'Bianco', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000002', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-t-shirt-christian-dior-couture'), 'DIOR-TSH-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000003', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-cintura-interlocking-g-in-pelle-avorio'), 'GUCCI-BEL-001-IVR', 'Avorio · misura da definire', 'Avorio', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000004', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-cardigan-reversibile-cappuccio-oblique'), 'DIOR-CAR-001-GRY', 'Grigio · taglia da definire', 'Grigio', NULL, NULL, 0, true)
ON CONFLICT ("sku") DO UPDATE SET
  "title" = EXCLUDED."title",
  "color" = EXCLUDED."color",
  "size" = EXCLUDED."size",
  "price_cents" = NULL,
  "stock_quantity" = 0,
  "is_active" = true,
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."product_images" ("id", "product_id", "url", "alt_text", "sort_order") VALUES
  ('51000000-0000-4000-8000-000000000001', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-t-shirt-christian-dior-couture'), '/images/catalog/dior-tshirt-christian-dior-couture.png', 'T-shirt Christian Dior Couture bianca e nera', 0),
  ('51000000-0000-4000-8000-000000000002', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-cintura-interlocking-g-in-pelle-avorio'), '/images/catalog/gucci-cintura-interlocking-g.png', 'Cintura Gucci color avorio con fibbia Interlocking G', 0),
  ('51000000-0000-4000-8000-000000000003', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-cardigan-reversibile-cappuccio-oblique'), '/images/catalog/dior-cardigan-oblique.png', 'Cardigan grigio con cappuccio e motivo Dior Oblique', 0)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;
