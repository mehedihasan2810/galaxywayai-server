export const userTypeDefs = `#graphql

scalar DateTime

type User {
  id: ID!

  email: String!
  password: String!

  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
    userByEmail(email: String!): User
    userById(id: String!): User
}
`;
