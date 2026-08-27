CREATE TABLE "luxury"."catalog_imports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"filename" text NOT NULL,
	"source_last_update" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"products_received" integer DEFAULT 0 NOT NULL,
	"products_imported" integer DEFAULT 0 NOT NULL,
	"variants_imported" integer DEFAULT 0 NOT NULL,
	"images_imported" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "luxury"."shipments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"status" text DEFAULT 'preparing' NOT NULL,
	"carrier" text,
	"service" text,
	"tracking_number" text,
	"tracking_url" text,
	"label_url" text,
	"note" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "luxury"."product_images" ADD COLUMN "source_image_id" text;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "supplier_retail_price_cents" integer;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "supplier_cost_cents" integer;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "supplier_stock_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "stock_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "supplier_variant_id" text;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "supplier_code" text;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "barcode" text;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "backorder" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "feed_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "luxury"."product_variants" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "supplier_retail_price_cents" integer;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "supplier_cost_cents" integer;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "price_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "status_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "catalog_source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "supplier_product_id" text;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "supplier_is_online" boolean;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "origin_country" text;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "hs_code" text;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "weight_grams" integer;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "feed_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "luxury"."products" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "luxury"."shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "luxury"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_catalog_imports_source_started" ON "luxury"."catalog_imports" USING btree ("source","started_at");--> statement-breakpoint
CREATE INDEX "idx_shipments_order_status" ON "luxury"."shipments" USING btree ("order_id","status");--> statement-breakpoint
CREATE INDEX "idx_shipments_tracking_number" ON "luxury"."shipments" USING btree ("tracking_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variants_supplier_id" ON "luxury"."product_variants" USING btree ("supplier_variant_id");--> statement-breakpoint
CREATE INDEX "idx_product_variants_barcode" ON "luxury"."product_variants" USING btree ("barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_source_supplier_id" ON "luxury"."products" USING btree ("catalog_source","supplier_product_id");--> statement-breakpoint
CREATE INDEX "idx_products_brand_status" ON "luxury"."products" USING btree ("brand","status");--> statement-breakpoint
CREATE INDEX "idx_products_gender_status" ON "luxury"."products" USING btree ("gender","status");