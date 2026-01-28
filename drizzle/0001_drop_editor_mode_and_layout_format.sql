-- Migration: Drop layout_format and editor_mode columns
-- These columns are no longer needed as the app now only supports longpage + canvas mode

-- First update existing invitations to use longpage format (for safety)
UPDATE "invitations" SET "layout_format" = 'longpage' WHERE "layout_format" = 'card';

--> statement-breakpoint
-- Drop the layout_format column
ALTER TABLE "invitations" DROP COLUMN "layout_format";

--> statement-breakpoint
-- Drop the editor_mode column
ALTER TABLE "invitations" DROP COLUMN "editor_mode";
