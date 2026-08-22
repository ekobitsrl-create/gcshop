INSERT INTO "luxury"."payment_methods" (
  "id", "code", "name", "provider", "is_enabled", "sort_order", "instructions"
) VALUES (
  '61000000-0000-4000-8000-000000000001',
  'stripe',
  'Carta di credito o debito',
  'stripe',
  true,
  0,
  'Pagamento sicuro gestito da Stripe. Sono accettate le carte abilitate sul conto.'
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "provider" = EXCLUDED."provider",
  "sort_order" = EXCLUDED."sort_order",
  "instructions" = EXCLUDED."instructions",
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

UPDATE "luxury"."payment_methods"
SET "sort_order" = "sort_order" + 1,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "code" IN ('paypal', 'bank_transfer');
