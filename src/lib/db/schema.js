import { sql } from "drizzle-orm";
import {
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

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
  title: text("title"),
  url: text("url"),
  shortUrl: text("short_url"),
  category: text("category"),
  categories: text("categories").array(),
  pricingModel: text("pricing_model"),
  features: text("features").array(),
  blog: text("blog"),
  label: text("label"),
  logo: text("logo"),
  image: text("image"),
  status: text("status"),
  suggestions: jsonb("suggestions").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const requestedTools = pgTable("requested_tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  url: text("url").notNull(),
  categories: text("categories").array(),
  pricingModel: text("pricing_model").notNull(),
  description: text("description").notNull(),
  otherDetails: text("other_details"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const oldTools = pgTable("old_tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  title: text("title"),
  description: text("description"),
  summary: text("summary"),
  tags: text("tags").array(),
  additionalTags: text("additional_tags").array(),
  url: text("url"),
  pricingModel: text("pricing_model"),
  image: text("image"),
  status: text("status"),
  likes: numeric("likes"),
  likedUsers: text("liked_users").array(),
  suggestions: jsonb("suggestions").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// export type User = typeof users.$inferSelect;
// export type Tool = typeof tools.$inferSelect;
