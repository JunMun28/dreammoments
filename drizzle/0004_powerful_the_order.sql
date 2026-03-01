ALTER TABLE "ai_generations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ai_generations" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_ai_lp_rate" ON "ai_generations" USING btree ("invitation_id","section_id","accepted");