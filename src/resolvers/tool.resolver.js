import { and, arrayOverlaps, asc, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../lib/db/index.js";
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import { nanoid } from "nanoid";
import puppeteer from "puppeteer";
import { oldTools, tools } from "../lib/db/schema.js";
import { encoding_for_model } from "tiktoken";
import {
  DeleteObjectCommand,
  // DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import "dotenv/config";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PROMPT_COMMON } from "../constants/common-prompt.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../lib/s3-client.js";
import { openai } from "../lib/openai.js";
import axios from "axios";
import * as cheerio from "cheerio";

const MAX_INPUT_TOKEN = 1000; // 1000 will be scraped content's max token  but with system and assistant message total token will be 1520
const MAX_OUTPUT_TOKEN = 1000;

const chromiumPack =
  "https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar";

// const chromiumPack =
//   "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export const toolResolver = {
  Query: {
    async tools() {
      const toolsRes = await db
        .select()
        .from(tools)
        .orderBy(desc(tools.updatedAt));

      console.log({ toolsRes });

      return toolsRes;
    },

    async publishedTools(_, { limit }) {
      console.log({ limit });
      const publishedToolsRes = await db
        .select()
        .from(tools)
        .where(eq(tools.status, "published"))
        .orderBy(desc(tools.updatedAt))
        .limit(limit);

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

      // console.log({ toolRes });

      return toolRes;
    },

    async oldTools() {
      const toolsRes = await db.select().from(oldTools);

      console.log({ toolsRes });

      return toolsRes;
    },

    async publishedOldTools(_, { limit }) {
      console.log({ limit });

      const publishedToolsRes = await db
        .select()
        .from(oldTools)
        .where(eq(oldTools.status, "published"))
        .limit(limit);

      console.log({ publishedToolsRes: publishedToolsRes.length });

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

    async searchTools(
      _,
      { query, pricing, categories, sortBy = "newest", limit }
    ) {
      console.log({ query, pricing, categories, sortBy, limit });

      const trimmedQuery = query.trim();
      const isPricing = pricing && pricing.length > 0;
      const isCategory = categories && categories.length > 0;

      let baseQuery = db
        .select()
        .from(tools)
        .where(eq(tools.status, "published"));
      const conditions = [];

      if (trimmedQuery) {
        conditions.push(
          or(
            ilike(tools.name, `%${trimmedQuery}%`),
            ilike(tools.title, `%${trimmedQuery}%`)
          )
        );
      }

      if (isPricing) {
        conditions.push(ilike(tools.pricingModel, pricing.join(",")));
      }

      if (isCategory) {
        conditions.push(arrayOverlaps(tools.tags, categories));
      }
      // arrayOverlaps

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      baseQuery = baseQuery.orderBy(
        sortBy === "newest" ? desc(tools.createdAt) : asc(tools.createdAt)
      );

      baseQuery = baseQuery.limit(limit);

      const [searchedTools, searchedToolsLength] = await Promise.all([
        baseQuery,
        (async () => {
          return (await baseQuery).length;
        })(),
      ]);

      console.log({ searchedToolsLength, limit });

      return { tools: searchedTools, count: searchedToolsLength };
    },

    async heroSearchTools(_, { query }) {
      console.log({ query });

      if (query.trim() === "") return [];

      const searchRes = await db
        .select()
        .from(tools)
        .where(
          and(
            or(
              ilike(tools.name, `%${query}%`),
              ilike(tools.title, `%${query}%`)
            ),
            eq(tools.status, "published")
          )
        );

      console.log({ searchRes: searchRes.length });

      return searchRes;
    },

    async signedUrl(_, { signedUrlInput: files }, _context, _info) {
      console.log({ files });

      const urls = {};

      for (const file of files) {
        const toolWebImageKey =
          file.keyName === "imageFile"
            ? `images/ai-tool/web-image/${file.fileName}-${Date.now()}-${
                file.fileType.split("/")[1]
              }`
            : `images/ai-tool/logo/${file.fileName}-${Date.now()}-${
                file.fileType.split("/")[1]
              }`;

        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: toolWebImageKey,
          // Key: generateFileName2(fileName, file.fileType.split("/")[1]),
          ContentType: file.fileType,
          ContentLength: file.fileSize,
          ChecksumSHA256: file.checksum,
          // Let's also add some metadata which is stored in s3.
          //  Metadata: {
          //   userId: session.user.id
          // },
        });

        const url = await getSignedUrl(
          s3Client,
          putObjectCommand,
          { expiresIn: 60 * 5 } // 5 minutes
        );
        urls[file.keyName] = url;
      }

      console.log({ urls });

      return urls;
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

    async deleteTool(_, { id, logoUrl, imageUrl }) {
      console.log({ id, logoUrl, imageUrl });
      const result = await Promise.all(
        [logoUrl, imageUrl].map(async (url) => {
          if (url) {
            // const key = url.replace(
            //   "https://galaxywayai.s3.eu-west-2.amazonaws.com/",
            //   ""
            // );

            const key = url.split(".com/").slice(-1)[0];

            console.log({ key });

            const deleteParams = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: key,
            };

            await s3Client.send(new DeleteObjectCommand(deleteParams));
          }
        })
      );

      console.log({ result });

      const deletedToolRes = await db
        .delete(tools)
        .where(eq(tools.id, id))
        .returning()
        .then((res) => res[0]);

      console.log({ deletedToolRes });

      return deletedToolRes;
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

      let { textContent, ssBuffer, scrapedToolLogoBuffer } =
        await scrapeWebsite(url);

      const encoding = encoding_for_model("gpt-4");
      let inputTokens = await countTokens(textContent, encoding);

      console.log(`input token1: ${inputTokens}`);

      if (inputTokens > MAX_INPUT_TOKEN) {
        const trimmedContent = await trimContent(
          textContent,
          MAX_INPUT_TOKEN,
          encoding
        );

        textContent = new TextDecoder().decode(trimmedContent);

        inputTokens = await countTokens(textContent, encoding); // Recount after trimming
      }

      console.log(`Input Tokens222: ${inputTokens}`);

      console.log({ textContent });

      const {
        name,
        title,
        pricingModel,
        category,
        categories,
        features,
        blog,
      } = await generateToolData(textContent);

      const { toolLogoImageUrl, toolWebImageUrl } = await uploadToolFiles(
        ssBuffer,
        scrapedToolLogoBuffer,
        name
      );

      const toolRes = await db
        .insert(tools)
        .values({
          name,
          title,
          url: `${url}/?ref=galaxywayai.com`,
          logo: toolLogoImageUrl,
          image: toolWebImageUrl,
          pricingModel,
          category,
          categories,
          features,
          blog,
          label: "New",
          status: "draft",
        })
        .returning()
        .then((res) => res[0]);

      console.log({ toolRes });

      const wholeApiEnd = Date.now();
      console.log(`API TOOK ${wholeApiEnd - wholeApiStart} ms to complete`);

      return toolRes;
    },

    async deleteFile(_, { deleteFileInput: url }, _context) {
      console.log({ url });

      console.log("DELETE FILE STARTED");

      const key = url.split(".com/").slice(-1)[0];

      // console.log({ key, url });

      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      };

      console.log({ deleteParams });

      await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log("DELETE FILE ENDED");
      return { data: "Successfully deleted the file", error: null };
    },
  },
};

async function countTokens(text, encoding) {
  return encoding.encode(text).length;
}

async function trimContent(content, maxTokens, encoding) {
  const encoded = encoding.encode(content);
  if (encoded.length > maxTokens) {
    const trimmed = encoded.slice(0, maxTokens);

    return encoding.decode(trimmed);
  }
  return content;
}

async function scrapeWebsite(urll) {
  const scrapingStart = Date.now();
  console.log("SCRAPING START");

  console.log({ urll });

  const url = urll.endsWith("/") ? urll.slice(0, -1) : urll;

  console.log({ url });

  const { data: html } = await axios.get(url);

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

  console.log("BEFORE LAUNCH");

  const browser = await puppeteerCore.launch({
    args: chromiumArgs,
    executablePath: executablePath,
    headless: true,
    // ignoreHTTPSErrors: true,
  });

  console.log("AFTER LAUNCH");

  const page = await browser.newPage();

  console.log("AFTER NEW PAGE");

  await page.setViewport({ width: 1200, height: 630 });

  console.log("AFTER VIEWPORT");

  await page.goto(url, {
    waitUntil: ["domcontentloaded"],
    timeout: 3000000,
  });

  console.log("AFTER GOTO");

  // let [ssBuffer] = await Promise.all([
  //   // page.evaluate(() => {
  //   //   const extractTextContent = (element) => {
  //   //     if (element.nodeType === Node.TEXT_NODE) {
  //   //       return element.textContent.trim();
  //   //     }
  //   //     if (element.nodeType !== Node.ELEMENT_NODE) {
  //   //       return "";
  //   //     }
  //   //     if (
  //   //       element.tagName === "SCRIPT" ||
  //   //       element.tagName === "STYLE" ||
  //   //       element.tagName === "NOSCRIPT"
  //   //     ) {
  //   //       return "";
  //   //     }
  //   //     let text = "";
  //   //     for (let child of element.childNodes) {
  //   //       text += extractTextContent(child) + " ";
  //   //     }
  //   //     return text.trim();
  //   //   };

  //   //   const title = document.querySelector("title")?.textContent?.trim() || "";
  //   //   const description =
  //   //     document
  //   //       .querySelector("meta[name='description']")
  //   //       ?.getAttribute("content")
  //   //       ?.trim() || "";
  //   //   const bodyText = extractTextContent(document.body);

  //   //   return [title, description, bodyText].filter(Boolean).join("\n\n");
  //   // }),

  //   // page.evaluate(() => {
  //   //   // const faviconLink =
  //   //   //   document.querySelector("link[rel~='icon']") ||
  //   //   //   document.querySelector("link[rel='shortcut icon']");
  //   //   const faviconLink =
  //   //     document.querySelector("link[rel~='icon'][type='image/png']") ||
  //   //     document.querySelector("link[rel='shortcut icon'][type='image/png']");
  //   //   return faviconLink ? faviconLink.href : null;
  //   // }),

  //   page.screenshot({
  //     // path: `./scrapingbee_homepage-${Date.now()}.webp`,
  //     type: "webp",
  //   }),
  // ]);

  const ssBuffer = await page.screenshot({
    // path: `./scrapingbee_homepage-${Date.now()}.webp`,
    type: "webp",
  });

  console.log("BUFFER START");
  console.log({ ssBuffer });
  console.log("BUFFER END");

  console.log({ scrapedToolLogoUrl });

  let scrapedToolLogoBuffer;
  if (scrapedToolLogoUrl) {
    const faviconUrl = `${url}${scrapedToolLogoUrl}`;
    console.log({ faviconUrl });

    const faviconResponse = await axios.get(faviconUrl, {
      responseType: "arraybuffer",
      // timeout: 600000,
    });
    // const faviconResponse = await page.goto(scrapedToolLogoUrl);
    // eslint-disable-next-line no-undef
    scrapedToolLogoBuffer = Buffer.from(faviconResponse.data);

    // console.log({ scrapedToolLogoBuffer });
  }

  console.log({ scrapedToolLogoBuffer });

  await page.close();
  await browser.close();

  console.log({ textContent });

  const scrapingEnd = Date.now();
  console.log(`SCRAPING END. ${scrapingEnd - scrapingStart} ms`);

  return { textContent, ssBuffer, scrapedToolLogoBuffer };
}

async function generateToolData(textContent) {
  const openaiStart = Date.now();
  console.log("OPENAI GENERATION START");

  const completion = await openai.chat.completions.create({
    response_format: { type: "json_object" },
    messages: [
      ...PROMPT_COMMON,
      {
        role: "user",
        content: textContent,
      },
    ],
    model: "gpt-4o-mini",
    // model: "gpt-4o",
    max_tokens: MAX_OUTPUT_TOKEN,
    // model: "Llama3-70b-8192",
    // Send the user ID through per OpenAI's best practices
    // for safety: https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids
    user: nanoid(),
  });

  const generatedContent = completion.choices[0].message.content;

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

  const { name, title, pricingModel, category, categories, features, blog } =
    JSON.parse(generatedContent);

  console.log({
    name,
    title,
    pricingModel,
    category,
    categories,
    features,
    blog,
  });

  const openaiEnd = Date.now();
  console.log(`OPENAI GENERATION END. ${openaiEnd - openaiStart} ms`);

  return {
    name,
    title,
    pricingModel,
    category,
    categories,
    features,
    blog,
  };
}

async function uploadToolFiles(ssBuffer, scrapedToolLogoBuffer, name) {
  const fileUploadStart = Date.now();
  console.log("FILES UPLOAD START");

  const [toolWebImageUrl, toolLogoImageUrl] = await Promise.all([
    (async function uploadToolWebImage() {
      const toolWebImageKey = `images/ai-tool/web-image/${name}-${Date.now()}-webp`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: toolWebImageKey,
        Body: ssBuffer,
        ContentType: "image/webp", // Adjust this based on your image type
      };

      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      // const url = `https://${process.env.S3_BUCKET_NAME}.s3.${
      //   process.env.S3_BUCKET_REGION
      // }.amazonaws.com/${encodeURIComponent(toolWebImageKey)}`;
      const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${toolWebImageKey}`;

      console.log({ url });

      console.log("Image upload successful ", response);
      return url;
    })(),
    (async function uploadToolLogoImage() {
      if (!scrapedToolLogoBuffer) return null;

      const webpBuffer = await sharp(scrapedToolLogoBuffer)
        .toFormat("webp")
        .toBuffer();

      const toolLogoKey = `images/ai-tool/logo/${name}-${Date.now()}-webp`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: toolLogoKey,
        Body: webpBuffer,
        ContentType: "image/webp", // Adjust this based on your image type
      };

      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      // const logoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${
      //   process.env.S3_BUCKET_REGION
      // }.amazonaws.com/${encodeURIComponent(toolLogoKey)}`;
      const logoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${toolLogoKey}`;

      console.log({ logoUrl });

      console.log("Logo upload successful ", response);
      return logoUrl;
    })(),
  ]);

  console.log({ toolLogoImageUrl, toolWebImageUrl });

  const fileUploadEnd = Date.now();
  console.log(`FILES UPLOAD END. ${fileUploadEnd - fileUploadStart} ms`);

  return { toolLogoImageUrl, toolWebImageUrl };
}

// function delay(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }
