import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.js";

import "dotenv/config";
import { Tool, tools } from "../lib/db/schema.js";

export const songResolver = {
  Query: {
    async tools(): Promise<Tool[]> {
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

    async tool(_: unknown, { id }: { id: string }): Promise<Tool> {
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
    async createTool(
      _: unknown,
      { tool }: { tool: Omit<Tool, "id" | "createdAt" | "updatedAt"> }
    ): Promise<Tool> {
      console.log({ tool });

      const createdToolRes = await db
        .insert(tools)
        .values(tool)
        .returning()
        .then((res) => res[0]);

      console.log({ createdToolRes });

      return createdToolRes;
    },

    async updateTool(
      _: unknown,
      { tool }: { tool: Omit<Tool, "createdAt" | "updatedAt"> }
    ): Promise<Tool> {
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

    // async deleteTool(_, { deleteSongInput }) {
    //   console.log({ deleteSongInput });

    //   const { id, songUrl, songImage, artistImage, albumImage } =
    //     deleteSongInput;

    //   const result = await Promise.all(
    //     [songUrl, songImage, artistImage, albumImage].map(async (url) => {
    //       if (url) {
    //         const key = url.split("/").slice(-1)[0];

    //         const deleteParams = {
    //           Bucket: process.env.S3_BUCKET_NAME,
    //           Key: key,
    //         };

    //         await s3Client.send(new DeleteObjectCommand(deleteParams));
    //       }
    //     })
    //   );

    //   console.log({ result });

    //   const deletedSongRes = await db
    //     .delete(songs)
    //     .where(eq(songs.id, id))
    //     .returning()
    //     .then((res) => res[0]);

    //   console.log({ deletedSongRes });

    //   return deletedSongRes;
    // },

    async updateStatus(
      _: unknown,
      { statusInput }: { statusInput: { id: string; status: string } }
    ): Promise<Tool> {
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
