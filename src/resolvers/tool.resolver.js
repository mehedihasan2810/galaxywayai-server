import { and, arrayContains, eq, ilike, or } from "drizzle-orm";
import { db } from "../lib/db/index.js";
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import { nanoid } from "nanoid";
// import axios from "axios";
import OpenAI from "openai";
import puppeteer from "puppeteer";
import { oldTools, tools } from "../lib/db/schema.js";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOKEN = 100000;

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

const chromiumPack =
  "https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar";
// const chromiumPack =
//   "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

// const tags = `AI Detection, Aggregators, Avatar, Chat, Copywriting, Finance, For Fun, Gaming, Generative Art, Generative Code, Generative Video, Image Improvement, Image Scanning, Inspiration, Marketing, Motion  Capture, Music, Podcasting, Productivity, Prompt Guides, Research, Self-Improvement, Social Media, Speech-To-Text, Text-To-Speech, Text-To-Video, Translation, Video Editing, Voice Modulation`;

// const pricing_model = `Free, Premium, GitHub, Google Colab, Open Source, Paid`;

// const PROMPT_COMMON = [
//   {
//     role: "system",
//     content: `You are a helpful assistant who generates a name, title, description, summary, tags, additional tags and pricing model from the given prompt.

//     When given a prompt, you will generate a name, a title, a description, a summary, tags, additional tags and pricing model from the given prompt. The prompt is content of a website.

// To generate the name, title, description, summary, tags, additional tags and pricing model, follow these guidelines:
// - The name should be the name of the website.
// - The title should be concise and captivating, representing the main theme or essence of the content. Also the title should be less than 100 characters. When adding the title to the response, write only the title, do not add any explanation before or after in your response. Do not wrap the title in any punctuation.
// - The description should provide a 1-2 sentence brief overview of the website's content, enticing users to explore further.
// - The summary should provide a brief overview of the website's content, enticing users to explore further. Keep it between 100 to 150 words.
// - The tags should be among these ${tags}. Generate maximum 3 tags.
// - The additional tags should be relevant keywords or phrases that users might search for when looking for similar content. Generate maximum 5 additional tags.
// - The pricing model should be among these words ${pricing_model}. If you can't find the pricing model then return empty string.

// Once you have all this information, return it in a JSON string with the keys: name, title, description, summary, tags, additional_tags, pricing_model. You MUST return valid JSON. Do NOT wrap the json output in \`\`\`json ... \`\`\`!
//       `,
//   },
//   {
//     role: "assistant",
//     content: "What is the content of the website?",
//   },
// ];

// const PROMPT_COMMON = [
//   {
//     role: "system",
//     content: `You are a helpful assistant who generates structured information about a website based on its content. When given a prompt containing website content, you will generate the following information:

// 1. name: The name of the website.
// 2. description: A brief 1-2 sentence overview of the website's content and purpose.
// 3. pricing_model: Choose from: Free, Freemium, Paid, Free Trial, Contact for Pricing, Deals. If uncertain, return an empty string.
// 4. category: A single value that best matches the website's primary purpose.
// 5. categories: An array of up to 3 strings representing the website's categories.
// 6. features: An array of strings, only including the following options: Waitlist, Open Source, Mobile App, API, Discord Community, Browser Extension. Include only the features that apply to the website.
// 7. blog: An HTML string (wrapped in backticks) containing a concise blog post about the website. Include information about its purpose, services, how it can help in daily life, and other important aspects. Keep the blog brief but informative.

// Return this information as a valid JSON string with the keys: name, description, pricing_model, category, categories, features, blog. Do NOT wrap the JSON output in \`\`\`json ... \`\`\`!`,
//   },
//   {
//     role: "assistant",
//     content:
//       "Please provide the content of the website you'd like me to analyze.",
//   },
// ];

// 2. description: A brief 1-2 sentence overview of the website's content and purpose.

const PROMPT_COMMON = [
  {
    role: "system",
    content: `You are a helpful assistant who generates structured information about a website based on its content. When given a prompt containing website content, you will generate the following information:

1. name: The name of the website.
2. title: The title should be concise and captivating, representing the main theme or essence of the content. Also the title should be less than 100 characters. When adding the title to the response, write only the title, do not add any explanation before or after in your response. Do not wrap the title in any punctuation.
3. pricingModel: Choose from: Free, Freemium, Paid, Free Trial, Contact for Pricing, Deals. If uncertain, return an empty string.
4. category: A single value that best matches the website's primary purpose.
5. categories: An array of up to 3 strings representing the website's categories.
6. features: An array of strings, only including the following options: Waitlist, Open Source, Mobile App, API, Discord Community, Browser Extension. Include only the features that apply to the website.
7. blog: An HTML string (wrapped in backticks) containing an informative blog post about the website. The blog should have the following structure:
   - Main title (h1)
   - Cover image: Use this URL: https://melodymaker.s3.eu-west-2.amazonaws.com/1d127e74bb7d7ffbb9b53e3f158640cee0e4f1953177d684ffaee7d5e1330cdb
   - Short description (p)
   - Multiple sections, each with:
     - Section title (h2)
     - Section content (p)
   - Use unordered lists (ul) and list items (li) where appropriate to present information clearly
   - The blog should comprehensively cover:
     - The website's purpose
     - Key features and services
     - How it can benefit users in their daily lives
     - Any unique selling points or innovations
     - Target audience
     - How to get started or use the service

Ensure the blog is informative, engaging, and provides a complete overview of the website while remaining concise. Use clear, professional language and organize the information logically.

Return this information as a valid JSON string with the keys: name, title, pricingModel, category, categories, features, blog. Do NOT wrap the JSON output in \`\`\`json ... \`\`\`!`,
  },
  {
    role: "assistant",
    content:
      "Please provide the content of the website you'd like me to analyze.",
  },
];

export const toolResolver = {
  Query: {
    async tools() {
      const toolsRes = await db.select().from(tools);

      console.log({ toolsRes });

      return toolsRes;
    },

    async publishedTools() {
      const publishedToolsRes = await db
        .select()
        .from(tools)
        .where(eq(tools.status, "published"));

      console.log({ publishedToolsRes });

      return publishedToolsRes;
    },

    async tool(_, { id }) {
      console.log({ id });

      const toolRes = await db
        .select()
        .from(tools)
        .where(eq(tools.id, id))
        .then((res) => res[0]);

      console.log({ toolRes });

      return toolRes;
    },

    async oldTools() {
      const toolsRes = await db.select().from(oldTools);

      console.log({ toolsRes });

      return toolsRes;
    },

    async publishedOldTools() {
      const publishedToolsRes = await db
        .select()
        .from(oldTools)
        .where(eq(oldTools.status, "published"));

      console.log({ publishedToolsRes });

      return publishedToolsRes;
    },

    async oldTool(_, { id }) {
      console.log({ id });

      const toolRes = await db
        .select()
        .from(oldTools)
        .where(eq(oldTools.id, id))
        .then((res) => res[0]);

      console.log({ toolRes });

      return toolRes;
    },

    async searchTools(_, { query, pricing, categories }) {
      console.log({ query, pricing, categories });

      const trimmedQuery = query.trim();
      const isPricing = pricing && pricing.length > 0;
      const isCategory = categories && categories.length > 0;

      let searchRes;

      if (isPricing || isCategory || trimmedQuery !== "") {
        console.log("query");
        searchRes = await db
          .select()
          .from(oldTools)
          .where(
            and(
              or(
                isPricing
                  ? ilike(oldTools.pricingModel, pricing.join(","))
                  : // ? arrayContains(oldTools.pricingModel, pricing)
                    undefined,
                isCategory
                  ? arrayContains(oldTools.tags, categories)
                  : undefined,
                trimmedQuery
                  ? or(
                      ilike(oldTools.name, `%${trimmedQuery}%`),
                      ilike(oldTools.title, `%${trimmedQuery}%`)
                    )
                  : undefined
              ),
              eq(oldTools.status, "published")
            )
          );
      } else {
        console.log("all");
        searchRes = await db
          .select()
          .from(oldTools)
          .where(eq(oldTools.status, "published"));
      }

      console.log({ searchRes: searchRes.length });

      return searchRes;
    },
  },

  Mutation: {
    async createTool(_, { tool }) {
      console.log({ tool });

      const createdToolRes = await db
        .insert(tools)
        .values(tool)
        .returning()
        .then((res) => res[0]);

      console.log({ createdToolRes });

      return createdToolRes;
    },

    async updateTool(_, { tool }) {
      console.log({ tool });

      const { id, ...input } = tool;

      const updatedToolRes = await db
        .update(tools)
        .set(input)
        .where(eq(tools.id, id))
        .returning()
        .then((res) => res[0]);

      console.log({ updatedToolRes });

      return updatedToolRes;
    },

    async updateStatus(_, { statusInput }) {
      console.log({ statusInput });

      const updatedStatusRes = await db
        .update(tools)
        .set({ status: statusInput.status })
        .where(eq(tools.id, statusInput.id))
        .returning()
        .then((res) => res[0]);

      console.log({ updatedStatusRes });

      return updatedStatusRes;
    },

    async generateTool(_, { url }) {
      const wholeApiStart = Date.now();
      console.log({ url });

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.error("OpenAI API key is not set in environment variables.");
        return {
          data: null,
          error: `OpenAI API key is not set in environment variables.`,
        };
      }

      const scrapingStart = Date.now();
      console.log("SCRAPING START");

      const isProduction = process.env.NODE_ENV === "production";

      console.log({ isProduction });

      const chromiumArgs = isProduction
        ? chromium.args
        : [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
          ];

      const executablePath = isProduction
        ? await chromium.executablePath(chromiumPack)
        : puppeteer.executablePath();

      const browser = await puppeteerCore.launch({
        args: chromiumArgs,
        executablePath: executablePath,
        headless: true,
        // ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 630 });
      // Navigate to the URL
      await page.goto(url);

      const [textContent, faviconUrl, ssBuffer] = await Promise.all([
        page.evaluate(() => {
          const textContentArray = [];
          const title = document.querySelector("title");
          textContentArray.push(title?.textContent?.trim());
          const descContent = document
            .querySelector("meta[name='description']")
            ?.getAttribute("content");
          textContentArray.push(descContent?.trim());
          const body = document.querySelector("body");
          const textNodes = body.querySelectorAll("*");
          textNodes.forEach((node) => {
            if (node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
              textContentArray.push(node.textContent?.trim());
            }
          });
          return textContentArray.join("\n");
        }),

        page.evaluate(() => {
          // const favicon = document.querySelector("link[rel*='icon']");
          // return favicon ? favicon.href : null;

          console.log(document.querySelector("link[rel~='icon']"));
          console.log(document.querySelector("link[rel='shortcut icon']"));

          const faviconLink =
            document.querySelector("link[rel~='icon']") ||
            document.querySelector("link[rel='shortcut icon']");
          return faviconLink ? faviconLink.href : null;
        }),

        page.screenshot({
          // path: `./scrapingbee_homepage-${Date.now()}.webp`,
          type: "webp",
        }),
      ]);

      console.log("BUFFER START");
      console.log({ ssBuffer });
      console.log("BUFFER END");

      console.log({ textContent: textContent.slice(0, 20), faviconUrl });

      let faviconBuffer;
      if (faviconUrl) {
        const faviconResponse = await page.goto(faviconUrl);
        faviconBuffer = await faviconResponse.buffer();

        console.log({ faviconBuffer });
      }

      await browser.close();

      const scrapingEnd = Date.now();
      console.log(`SCRAPING END. ${scrapingEnd - scrapingStart} ms`);

      const openaiStart = Date.now();
      console.log("OPENAI GENERATION START");

      const completion = await openai.chat.completions.create({
        response_format: { type: "json_object" },
        messages: [
          ...PROMPT_COMMON,
          {
            role: "user",
            content:
              textContent.length > MAX_TOKEN
                ? textContent.slice(0, MAX_TOKEN)
                : textContent,
          },
        ],
        model: "gpt-4o",
        // Send the user ID through per OpenAI's best practices
        // for safety: https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids
        user: nanoid(),
      });

      const r = completion.choices[0].message.content;

      // const openaiResponse = await axios.post(
      //   "https://api.openai.com/v1/chat/completions",
      //   {
      //     model: "gpt-4o",
      //     // model: "gpt-4-1106-preview",
      //     response_format: { type: "json_object" },
      //     // model: "gpt-4",
      //     messages: [
      //       ...PROMPT_COMMON,
      //       {
      //         role: "user",
      //         content:
      //           textContent.length > MAX_TOKEN
      //             ? textContent.slice(0, MAX_TOKEN)
      //             : textContent,
      //       },
      //     ],
      //     user: nanoid(),
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${openaiApiKey}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // if (openaiResponse.data.error) {
      //   console.log(openaiResponse.data.error);
      // }

      // const r = openaiResponse.data.choices[0].message.content;

      const promptRes = JSON.parse(r);
      console.log({ promptRes });

      const openaiEnd = Date.now();
      console.log(`OPENAI GENERATION END. ${openaiEnd - openaiStart} ms`);

      const wholeApiEnd = Date.now();
      console.log(`API TOOK ${wholeApiEnd - wholeApiStart} ms to complete`);

      return { data: "Successfully generated", error: null };
    },
  },
};
