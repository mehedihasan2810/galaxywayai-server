import { toolTypeDefs } from "./tool.typeDefs";
import { userTypeDefs } from "./user.typeDefs";

export const typeDefs = `
  ${userTypeDefs}
  ${toolTypeDefs}
`;
