CREATE TABLE IF NOT EXISTS "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"description" text,
	"url" text NOT NULL,
	"short_url" text,
	"category" text,
	"categories" text[],
	"pricing_model" text,
	"feature" text,
	"blog" text,
	"label" text,
	"profile_image" text,
	"image" text,
	"status" text,
	"suggestions" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
