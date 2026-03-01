ALTER TABLE "ai_generations" ADD COLUMN "status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ai_generations" ADD COLUMN "external_job_id" varchar(255);--> statement-breakpoint
ALTER TABLE "ai_generations" ADD COLUMN "result_url" text;--> statement-breakpoint
CREATE INDEX "idx_ai_external_job" ON "ai_generations" USING btree ("external_job_id");