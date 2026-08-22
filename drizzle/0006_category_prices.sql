UPDATE "luxury"."products" AS product
SET "base_price_cents" = CASE category."slug"
      WHEN 'cinture' THEN 12000
      WHEN 't-shirt' THEN 8000
      WHEN 'pantaloni' THEN 14000
    END,
    "metadata_json" = (COALESCE(product."metadata_json", '{}')::jsonb - 'pricePending')::text,
    "updated_at" = CURRENT_TIMESTAMP
FROM "luxury"."categories" AS category
WHERE product."category_id" = category."id"
  AND category."slug" IN ('cinture', 't-shirt', 'pantaloni');--> statement-breakpoint

UPDATE "luxury"."product_variants" AS variant
SET "price_cents" = product."base_price_cents",
    "updated_at" = CURRENT_TIMESTAMP
FROM "luxury"."products" AS product
JOIN "luxury"."categories" AS category ON product."category_id" = category."id"
WHERE variant."product_id" = product."id"
  AND category."slug" IN ('cinture', 't-shirt', 'pantaloni');
