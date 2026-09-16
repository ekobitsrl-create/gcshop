CREATE TABLE "luxury"."newsletter_subscribers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"locale" text NOT NULL,
	"consent_version" text NOT NULL,
	"consent_text" text NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "luxury"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_newsletter_email" ON "luxury"."newsletter_subscribers" USING btree ("email");
--> statement-breakpoint
REVOKE ALL ON "luxury"."newsletter_subscribers" FROM PUBLIC;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "luxury"."newsletter_subscribers" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON "luxury"."newsletter_subscribers" FROM authenticated;
  END IF;
END $$;
