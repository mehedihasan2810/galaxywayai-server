export const toolTypeDefs = `#graphql

scalar DateTime

type Suggestions {
    id: String
    name: String
    email: String
    reason: String
    suggestion: String
    createdAt: String
    updatedAt: String
}

type Tool {
    id: ID!
 
    name: String;
    description: String
    url: String
    shortUrl: String
    profileImage: String
    image: String
    category: String
    categories: [String]

    pricingModel: String
    feature: String
    blog: String
    label: String

    suggestions: [Suggestions]

    status: String

    createdAt: DateTime!
    updatedAt: DateTime!
}

input CreateToolInput {
    name: String;
    description: String
    url: String
    shortUrl: String
    profileImage: String
    image: String
    category: String
    categories: [String]

    pricingModel: String
    feature: String
    blog: String
    label: String

    suggestions: [Suggestions]

    status: String
}

input UpdateToolInput {
    id: String
     
    name: String;
    description: String
    url: String
    shortUrl: String
    profileImage: String
    image: String
    category: String
    categories: [String]

    pricingModel: String
    feature: String
    blog: String
    label: String

    suggestions: [Suggestions]

    status: String
}

input StatusInput {
    id: String!
    status: String!
}


type Query {
    tools: [Tool]
    tool(id: String!): Tool
    publishedTools: [Tool]
}

type Mutation {
    createTool(tool: CreateToolInput): Tool
    updateTool(tool: UpdateToolInput): Tool
    deleteTool(id: String): Tool
    updateStatus(statusInput: StatusInput): Tool
}
`;
