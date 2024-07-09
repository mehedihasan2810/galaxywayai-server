import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.js";

import "dotenv/config";
import { tools } from "../lib/db/schema.js";

export const toolResolver = {
  Query: {
    async tools() {
      const toolsRes = await db.select().from(tools);

      console.log({ toolsRes });

      return toolsRes;
    },

    async publishedTools() {
      const publishedToolsRes = await db
        .select()
        .from(tools)
        .where(eq(tools.status, "published"));

      console.log({ publishedToolsRes });

      return publishedToolsRes;
    },

    async tool(_, { id }) {
      console.log({ id });

      const toolRes = await db
        .select()
        .from(tools)
        .where(eq(tools.id, id))
        .then((res) => res[0]);

      console.log({ toolRes });

      return toolRes;
    },
  },

  Mutation: {
    async createTool(_, { tool }) {
      console.log({ tool });

      const createdToolRes = await db
        .insert(tools)
        .values(tool)
        .returning()
        .then((res) => res[0]);

      console.log({ createdToolRes });

      return createdToolRes;
    },

    async updateTool(_, { tool }) {
      console.log({ tool });

      const { id, ...input } = tool;

      const updatedToolRes = await db
        .update(tools)
        .set(input)
        .where(eq(tools.id, id))
        .returning()
        .then((res) => res[0]);

      console.log({ updatedToolRes });

      return updatedToolRes;
    },

    async updateStatus(_, { statusInput }) {
      console.log({ statusInput });

      const updatedStatusRes = await db
        .update(tools)
        .set({ status: statusInput.status })
        .where(eq(tools.id, statusInput.id))
        .returning()
        .then((res) => res[0]);

      console.log({ updatedStatusRes });

      return updatedStatusRes;
    },
  },
};
