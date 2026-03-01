CREATE TABLE "rate_limit_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"store_name" varchar(100) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_blocklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_invitation_id_invitations_id_fk";
--> statement-breakpoint
DROP INDEX "idx_views_invitation";--> statement-breakpoint
DROP INDEX "idx_views_date";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_rate_limit_key_store" ON "rate_limit_entries" USING btree ("key","store_name");--> statement-breakpoint
CREATE INDEX "idx_blocklist_token_hash" ON "token_blocklist" USING btree ("token_hash");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_guests_email" ON "guests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_views_invitation_date" ON "invitation_views" USING btree ("invitation_id","viewed_at");--> statement-breakpoint
CREATE INDEX "idx_invitations_status" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");