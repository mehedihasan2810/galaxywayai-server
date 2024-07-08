export const userTypeDefs = `#graphql

scalar DateTime

type User {
  id: ID!
 
  username: String;
  email: String!
  password: String
  emailVerified: DateTime

  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
    userByEmail(email: String!): User
    userById(id: String!): User
}
`;
