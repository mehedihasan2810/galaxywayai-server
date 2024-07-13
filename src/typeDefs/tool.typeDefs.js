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
    name: String
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

type OldTool {
    id: ID!
    name: String
    title: String
    description: String
    url: String
    summary: String
    tags: [String]
    additionalTags: [String]
    image: String
    pricingModel: String
    suggestions: [Suggestions]
    likes: Int
    likedUsers: [String]
    status: String
    createdAt: DateTime!
    updatedAt: DateTime!
}

input SuggestionsInput {
    id: String
    name: String
    email: String
    reason: String
    suggestion: String
    createdAt: String
    updatedAt: String
}

type GenerateToolRes {
    data: String
    error: String
}

input CreateToolInput {
    name: String
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
    suggestions: [SuggestionsInput]
    status: String
}

input UpdateToolInput {
    id: String
    name: String
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
    suggestions: [SuggestionsInput]
    status: String
}

input StatusInput {
    id: String!
    status: String!
}


type Query {
    tools: [Tool!]!
    tool(id: String!): Tool
    publishedTools: [Tool!]!

    oldTools: [OldTool!]!
    oldTool(id: String!): OldTool
    publishedOldTools(limit: Int): [OldTool!]!
    searchTools(query: String!, pricing: [String], categories: [String], sortBy: String!, limit: Int): [OldTool!]!

    heroSearchTools(query: String!): [OldTool!]!
}

type Mutation {
    createTool(tool: CreateToolInput): Tool
    updateTool(tool: UpdateToolInput): Tool
    # deleteTool(id: String): Tool
    updateStatus(statusInput: StatusInput): Tool
    generateTool(url: String): GenerateToolRes
}
`;
