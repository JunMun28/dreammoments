ALTER TABLE "password_reset_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rate_limit_entries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "token_blocklist" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "password_reset_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "rate_limit_entries" CASCADE;--> statement-breakpoint
DROP TABLE "token_blocklist" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clerk_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "auth_provider";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");
