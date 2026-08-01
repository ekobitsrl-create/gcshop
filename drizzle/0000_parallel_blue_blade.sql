CREATE SCHEMA IF NOT EXISTS "luxury";
--> statement-breakpoint
CREATE TABLE "luxury"."admin_audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."cart_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."carts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token" uuid NOT NULL,
	"customer_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."coupon_uses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"coupon_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid,
	"discount_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."coupons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'percentage' NOT NULL,
	"value" integer NOT NULL,
	"minimum_order_cents" integer,
	"maximum_discount_cents" integer,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."customer_addresses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" text DEFAULT 'shipping' NOT NULL,
	"recipient_name" text NOT NULL,
	"company" text,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"postal_code" text NOT NULL,
	"city" text NOT NULL,
	"province" text,
	"country_code" text DEFAULT 'IT' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"accepts_marketing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."inventory_movements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity_delta" integer NOT NULL,
	"reason" text NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"note" text,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."order_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"product_name" text NOT NULL,
	"variant_name" text,
	"sku" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"total_cents" integer NOT NULL,
	"tax_rate_bps" integer DEFAULT 2200 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" uuid,
	"cart_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"fulfillment_status" text DEFAULT 'unfulfilled' NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"tax_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"payment_method_code" text NOT NULL,
	"shipping_address_json" text NOT NULL,
	"billing_address_json" text NOT NULL,
	"customer_note" text,
	"internal_note" text,
	"paid_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."payment_methods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"public_config_json" text,
	"instructions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."payment_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_method_code" text NOT NULL,
	"provider_reference" text,
	"type" text DEFAULT 'authorization' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"response_json" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."product_images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."product_variants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"title" text DEFAULT 'Standard' NOT NULL,
	"color" text,
	"size" text,
	"price_cents" integer,
	"compare_at_price_cents" integer,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 2 NOT NULL,
	"weight_grams" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sku" text NOT NULL,
	"short_description" text,
	"description" text,
	"brand" text,
	"gender" text DEFAULT 'unisex' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"base_price_cents" integer DEFAULT 0 NOT NULL,
	"compare_at_price_cents" integer,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"tax_rate_bps" integer DEFAULT 2200 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"metadata_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luxury"."site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value_json" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "luxury"."cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "luxury"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "luxury"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "luxury"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "luxury"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "luxury"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."coupon_uses" ADD CONSTRAINT "coupon_uses_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "luxury"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."coupon_uses" ADD CONSTRAINT "coupon_uses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "luxury"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."coupon_uses" ADD CONSTRAINT "coupon_uses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "luxury"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "luxury"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."inventory_movements" ADD CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "luxury"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "luxury"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "luxury"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "luxury"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "luxury"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "luxury"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "luxury"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "luxury"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "luxury"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "luxury"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_audit_actor_created" ON "luxury"."admin_audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_admin_audit_entity" ON "luxury"."admin_audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cart_items_cart_variant" ON "luxury"."cart_items" USING btree ("cart_id","variant_id");--> statement-breakpoint
CREATE INDEX "idx_cart_items_product_id" ON "luxury"."cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_carts_token" ON "luxury"."carts" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_carts_customer_status" ON "luxury"."carts" USING btree ("customer_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_slug" ON "luxury"."categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_categories_parent_id" ON "luxury"."categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_categories_active_sort" ON "luxury"."categories" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_coupon_uses_coupon_order" ON "luxury"."coupon_uses" USING btree ("coupon_id","order_id");--> statement-breakpoint
CREATE INDEX "idx_coupon_uses_customer" ON "luxury"."coupon_uses" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_coupons_code" ON "luxury"."coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_coupons_active_dates" ON "luxury"."coupons" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "idx_customer_addresses_customer_type" ON "luxury"."customer_addresses" USING btree ("customer_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_customers_email" ON "luxury"."customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_variant_created" ON "luxury"."inventory_movements" USING btree ("variant_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_reference" ON "luxury"."inventory_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "luxury"."order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_orders_order_number" ON "luxury"."orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_orders_customer_created" ON "luxury"."orders" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_status_created" ON "luxury"."orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_payment_status" ON "luxury"."orders" USING btree ("payment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payment_methods_code" ON "luxury"."payment_methods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_enabled_sort" ON "luxury"."payment_methods" USING btree ("is_enabled","sort_order");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_order_id" ON "luxury"."payment_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_provider_ref" ON "luxury"."payment_transactions" USING btree ("provider_reference");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_status_created" ON "luxury"."payment_transactions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_product_images_product_sort" ON "luxury"."product_images" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variants_sku" ON "luxury"."product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_product_variants_product_active" ON "luxury"."product_variants" USING btree ("product_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_product_variants_low_stock" ON "luxury"."product_variants" USING btree ("stock_quantity","low_stock_threshold");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_slug" ON "luxury"."products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_sku" ON "luxury"."products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "luxury"."products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_status_created" ON "luxury"."products" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_products_featured_status" ON "luxury"."products" USING btree ("is_featured","status");
