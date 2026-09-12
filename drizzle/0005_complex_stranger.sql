CREATE TABLE "luxury"."withdrawal_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"receipt_code" text NOT NULL,
	"order_id" uuid,
	"order_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"items_description" text,
	"declaration_text" text NOT NULL,
	"locale" text DEFAULT 'it' NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmation_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "luxury"."withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "luxury"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_withdrawal_requests_receipt_code" ON "luxury"."withdrawal_requests" USING btree ("receipt_code");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_order_created" ON "luxury"."withdrawal_requests" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_status_created" ON "luxury"."withdrawal_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_email_created" ON "luxury"."withdrawal_requests" USING btree ("email","created_at");