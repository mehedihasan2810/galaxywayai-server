ALTER TABLE "tools" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN IF EXISTS "description";