ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerified";