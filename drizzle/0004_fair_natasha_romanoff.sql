CREATE TABLE "luxury"."product_translations" (
	"product_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"description" text,
	"color" text,
	"composition" text,
	"category" text,
	"subcategory" text,
	"season" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_translations_pkey" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
ALTER TABLE "luxury"."product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "luxury"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_translations_locale_name" ON "luxury"."product_translations" USING btree ("locale","name");