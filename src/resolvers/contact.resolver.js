import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.js";
import { contacts } from "../lib/db/schema.js";

export const contactResolver = {
  Query: {
    async contact(_, { id }) {
      console.log({ id });

      const contactRes = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, id))
        .then((res) => res[0]);

      console.log(contactRes);

      return contactRes;
    },
    async contacts(_, { limit, offset }) {

      console.log({limit, offset})

      const contactsRes = await db
        .select()
        .from(contacts)
        .limit(limit)
        .offset(offset);

      console.log({ contactsRes });

      return contactsRes;
    },
  },
  Mutation: {
    async createContact(_, { contactInput }) {
      console.log({ contactInput });

      const createdContactRes = await db
        .insert(contacts)
        .values(contactInput)
        .returning()
        .then((res) => res[0]);

      console.log({ createdContactRes });

      return createdContactRes;
    },

    async deleteContact(_, { id }) {
      console.log({ id });

      const deletedContactRes = await db
        .delete(contacts)
        .where(eq(contacts.id, id))
        .returning()
        .then((res) => res[0]);

      console.log({ deletedContactRes });

      return deletedContactRes;
    },
  },
};
