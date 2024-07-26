import { requestedToolResolver } from "./requested-tool.resolver.js";
import { toolResolver } from "./tool.resolver.js";
import { userResolver } from "./user.resolver.js";

export const resolvers = {
  Query: {
    ...userResolver.Query,
    ...toolResolver.Query,
    ...requestedToolResolver.Query,
  },
  Mutation: {
    // ...userResolver.Mutation,
    ...toolResolver.Mutation,
    ...requestedToolResolver.Mutation,
  },
};
