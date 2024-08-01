import { contactResolver } from "./contact.resolver.js";
import { requestedToolResolver } from "./requested-tool.resolver.js";
import { toolResolver } from "./tool.resolver.js";
import { userResolver } from "./user.resolver.js";

export const resolvers = {
  Query: {
    ...userResolver.Query,
    ...toolResolver.Query,
    ...requestedToolResolver.Query,
    ...contactResolver.Query,
  },
  Mutation: {
    // ...userResolver.Mutation,
    ...toolResolver.Mutation,
    ...requestedToolResolver.Mutation,
    ...contactResolver.Mutation,
  },
};
