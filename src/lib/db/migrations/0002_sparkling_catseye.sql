CREATE TABLE IF NOT EXISTS "old_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"title" text,
	"description" text,
	"summary" text,
	"tags" text[],
	"additional_tags" text[],
	"url" text,
	"pricing_model" text,
	"image" text,
	"status" text,
	"likes" numeric,
	"liked_users" text[],
	"suggestions" jsonb[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
