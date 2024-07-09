import { toolResolver } from "./tool.resolver.js";
import { userResolver } from "./user.resolver.js";

export const resolvers = {
  Query: {
    ...userResolver.Query,
    ...toolResolver.Query,
  },
  Mutation: {
    // ...userResolver.Mutation,
    ...toolResolver.Mutation,
  },
};
