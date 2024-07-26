import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.js";
import { requestedTools } from "../lib/db/schema.js";

export const requestedToolResolver = {
  Query: {
    async requestedTools(_, { limit, offset }) {
      console.log({ limit, offset });
      const requestedToolsRes = await db
        .select()
        .from(requestedTools)
        .limit(limit)
        .offset(offset);

      console.log({ requestedToolsRes });

      return requestedToolsRes;
    },

    async requestedTool(_, { id }) {
      console.log({ id });

      const requestedToolRes = await db
        .select()
        .from(requestedTools)
        .where(eq(requestedTools.id, id))
        .then((res) => res[0]);

      console.log({ requestedToolRes });

      return requestedToolRes;
    },
  },
  Mutation: {
    async createRequestedTool(_, { requestedTool }) {
      console.log({ requestedTool });

      const createdRequestedToolRes = await db
        .insert(requestedTools)
        .values(requestedTool)
        .returning()
        .then((res) => res[0]);

      console.log({ createdRequestedToolRes });

      return createdRequestedToolRes;
    },
    async updateRequestedTool(_, { requestedTool }) {
      console.log({ requestedTool });
      const { id, ...input } = requestedTool;

      const updatedRequestedToolRes = await db
        .update(requestedTools)
        .set(input)
        .where(eq(requestedTools.id, id))
        .returning()
        .then((res) => res[0]);

      console.log({ updatedRequestedToolRes });

      return updatedRequestedToolRes;
    },

    async deleteRequestedTool(_, { id }) {
      console.log({ id });

      //   await new Promise((resolve) => {
      //     setTimeout(resolve, 2000);
      //   });

      //   return {
      //     id: "1",
      //     name: "name",
      //     email: "mail",
      //     url: "url",
      //     categories: ["ccc"],
      //     pricingModel: "paid",
      //     description: "desc",
      //     otherDetails: "other",
      //     createdAt: "2024-07-21 22:11:07.6964+06",
      //     updatedAt: "2024-07-21 22:11:07.6964+06",
      //   };

      const deletedRequestedToolRes = await db
        .delete(requestedTools)
        .where(eq(requestedTools.id, id))
        .returning()
        .then((res) => res[0]);

      console.log({ deletedRequestedToolRes });

      return deletedRequestedToolRes;
    },
  },
};
