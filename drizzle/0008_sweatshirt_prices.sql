UPDATE "luxury"."products" AS product
SET "base_price_cents" = 18000,
    "metadata_json" = (COALESCE(product."metadata_json", '{}')::jsonb - 'pricePending')::text,
    "updated_at" = CURRENT_TIMESTAMP
FROM "luxury"."categories" AS category
WHERE product."category_id" = category."id"
  AND category."slug" = 'felpe-e-cardigan';--> statement-breakpoint

UPDATE "luxury"."product_variants" AS variant
SET "price_cents" = 18000,
    "updated_at" = CURRENT_TIMESTAMP
FROM "luxury"."products" AS product
JOIN "luxury"."categories" AS category ON product."category_id" = category."id"
WHERE variant."product_id" = product."id"
  AND category."slug" = 'felpe-e-cardigan';
