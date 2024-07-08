import { db } from "../lib/db";
import { User } from "../lib/db/schema";

export const userResolver = {
  Query: {
    async userByEmail(
      _: unknown,
      { email }: { email: string }
    ): Promise<User | null> {
      console.log({ email });

      const userRes = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      return userRes;

      // return { id: "1", email: "user@gmail.com", password: "passs" };
    },

    async userById(_: unknown, { id }: { id: string }) {
      console.log({ id });

      const userRes = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, id),
      });

      return userRes;

      // return { id: "1", email: "user@gmail.com", password: "passs" };
    },
  },
  // Mutation: {},
};
