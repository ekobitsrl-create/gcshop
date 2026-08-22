UPDATE "luxury"."product_variants"
SET "stock_quantity" = 20,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "is_active" = true;
