ALTER TABLE "tools" ADD COLUMN "features" text[];--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN IF EXISTS "feature";