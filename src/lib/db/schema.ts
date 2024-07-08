import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tools = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  description: text("description"),
  url: text("url"),
  shortUrl: text("short_url"),
  category: text("category"),
  categories: text("categories").array(),
  pricingModel: text("pricing_model"),
  feature: text("feature"),
  blog: text("blog"),
  label: text("label"),
  profileImage: text("profile_image"),
  image: text("image"),
  status: text("status"),
  suggestions: jsonb("suggestions").$type<
    Array<{
      id: string;
      name: string;
      email: string;
      reason: string;
      suggestion: string;
      created_at: string;
      updated_at: string;
    }>
  >(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type Tool = typeof tools.$inferSelect;
