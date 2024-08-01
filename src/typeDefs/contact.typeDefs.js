export const contactTypeDefs = `#graphql

scalar DateTime

type Contact {
  id: ID!
  name: String!
  email: String!
  phoneNumber: String
  message: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}
input ContactInput {
  name: String!
  email: String!
  phoneNumber: String
  message: String!
}

type Query {
    contact(id: String!): Contact
    contacts(limit: Int, offset: Int): [Contact]!
}

type Mutation {
    createContact(contactInput: ContactInput!): Contact
    deleteContact(id: String!): Contact!
}
`;
