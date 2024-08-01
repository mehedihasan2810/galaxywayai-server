import { contactTypeDefs } from "./contact.typeDefs.js";
import { requestedToolTypeDefs } from "./requested-tool.typeDefs.js";
import { toolTypeDefs } from "./tool.typeDefs.js";
import { userTypeDefs } from "./user.typeDefs.js";

export const typeDefs = `
  ${userTypeDefs}
  ${toolTypeDefs}
  ${requestedToolTypeDefs}
  ${contactTypeDefs}
`;
