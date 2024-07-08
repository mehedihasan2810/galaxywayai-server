import { userResolver } from "./user.resolver.js";

export const resolvers = {
  Query: {
    ...userResolver.Query,
  },
  // Mutation: {
  //   ...userResolver.Mutation,
  // },
};
