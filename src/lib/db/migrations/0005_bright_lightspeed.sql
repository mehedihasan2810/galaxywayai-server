CREATE TABLE IF NOT EXISTS "requested_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"url" text NOT NULL,
	"categories" text[],
	"pricing_model" text NOT NULL,
	"description" text NOT NULL,
	"other_details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
