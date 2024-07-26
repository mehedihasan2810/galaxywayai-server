export const requestedToolTypeDefs = `#graphql

scalar DateTime


type RequestedTool {
    id: ID!
    name: String!
    email: String!
    url: String!
    categories: [String]
    pricingModel: String!
    description: String!
    otherDetails: String
    createdAt: DateTime!
    updatedAt: DateTime!
}



input RequestedToolInput {
    name: String!
    email: String!
    url: String!
    categories: [String]
    pricingModel: String!
    description: String!
    otherDetails: String
}

input UpdateRequestedToolInput {
    id: ID!
    name: String!
    email: String!
    url: String!
    categories: [String]
    pricingModel: String!
    description: String!
    otherDetails: String
}

type Query {
    requestedTools(limit: Int, offset: Int): [RequestedTool]!
    requestedTool(id: String!): RequestedTool
}

type Mutation {
    createRequestedTool(requestedTool: RequestedToolInput!): RequestedTool
    updateRequestedTool(requestedTool: UpdateRequestedToolInput!): RequestedTool
    deleteRequestedTool(id: String!): RequestedTool
}
`;
