CREATE TABLE "invitation_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"design_overrides" jsonb,
	"reason" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitation_snapshots" ADD CONSTRAINT "invitation_snapshots_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_snapshots_invitation" ON "invitation_snapshots" USING btree ("invitation_id");
