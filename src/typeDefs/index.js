import { toolTypeDefs } from "./tool.typeDefs.js";
import { userTypeDefs } from "./user.typeDefs.js";

export const typeDefs = `
  ${userTypeDefs}
  ${toolTypeDefs}
`;
