UPDATE "luxury"."products" AS product
SET "base_price_cents" = CASE category."slug"
      WHEN 'camicie-e-polo' THEN 9000
      WHEN 'giacche' THEN 20000
    END,
    "metadata_json" = (COALESCE(product."metadata_json", '{}')::jsonb - 'pricePending')::text,
    "updated_at" = CURRENT_TIMESTAMP
FROM "luxury"."categories" AS category
WHERE product."category_id" = category."id"
  AND category."slug" IN ('camicie-e-polo', 'giacche');--> statement-breakpoint

UPDATE "luxury"."product_variants" AS variant
SET "price_cents" = product."base_price_cents",
    "updated_at" = CURRENT_TIMESTAMP
FROM "luxury"."products" AS product
JOIN "luxury"."categories" AS category ON product."category_id" = category."id"
WHERE variant."product_id" = product."id"
  AND category."slug" IN ('camicie-e-polo', 'giacche');
