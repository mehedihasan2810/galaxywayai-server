export const userResolver = {
  Query: {
    async userByEmail(_: unknown, { email }: { email: string }) {
      console.log({ email });
      return { id: "1", email: "user@gmail.com", password: "passs" };
    },

    async userById(_: unknown, { id }) {
      console.log({ id });
      return { id: "1", email: "user@gmail.com", password: "passs" };
    },
  },
  // Mutation: {},
};
