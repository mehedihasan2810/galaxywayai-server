import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // apiKey: process.env.GROQ_API_KEY,
  // baseURL: "https://api.groq.com/openai/v1",
});
