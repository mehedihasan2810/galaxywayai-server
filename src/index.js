import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { resolvers } from "./resolvers/index.js";
import { typeDefs } from "./typeDefs/index.js";

import { tools } from "./lib/db/schema.js";
import { db } from "./lib/db/index.js";
import "dotenv/config";
import { createStory } from "./controllers/create-story.js";
import axios from "axios";
import * as cheerio from "cheerio";

const PORT = process.env.PORT || 4000;
const app = express();

app.use(morgan("dev"));
// app.use(helmet());
app.use(cors());
app.use(express.json());

// (async () => {
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use("/graphql", cors(), json(), expressMiddleware(server));

app.get("/", async (_, res) => {
  res.status(200).send("I am aliveee44...");
});

app.get("/scrape", async (_, res) => {
  const scrapingStart = Date.now();
  console.log("SCRAPING START");

  // Fetch the HTML content using axios instead of Puppeteer
  const { data: html } = await axios.get("https://www.atlas.org");

  // Load the HTML content into Cheerio
  const $ = cheerio.load(html);

  $("script, style, noscript").remove();

  // Extract text content using Cheerio
  const title = $("title").text().trim();
  const description =
    $("meta[name='description']").attr("content")?.trim() || "";
  const bodyText = $("body").text().trim();

  // Combine title, description, and body text
  const textContent = [title, description, bodyText]
    .filter(Boolean)
    .join("\n\n")
    .replaceAll(/\s+/g, " ");
  // .replaceAll("\n", " ");

  // Extract favicon (or any other image)
  const scrapedToolLogoUrl =
    $("link[rel~='icon'][type='image/png']").attr("href") ||
    $("link[rel='shortcut icon'][type='image/png']").attr("href");

  console.log({ title, description, scrapedToolLogoUrl, textContent });

  const scrapingEnd = Date.now();
  console.log(`SCRAPING END. ${scrapingEnd - scrapingStart} ms`);
  res.status(200).send({ scrapedToolLogoUrl, textContent });
});

app.get("/test", async (_, res) => {
  const toolsRes = await db.select().from(tools);
  res.status(200).send({ message: "I am aliveee...", toolsRes });
});

app.post("/create-story", createStory);

app.listen(PORT, () => {
  console.log(`Express server is running on: http://localhost:${PORT}`);
  console.log(`GraphQL server is running on: http://localhost:${PORT}/graphql`);
});
// })();
