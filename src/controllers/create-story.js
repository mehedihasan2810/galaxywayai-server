import axios from "axios";
import { storymakerDB } from "../lib/db/storymaker-db.js";
import { stories } from "../lib/db/storymaker-schema.js";
import { openai } from "../lib/openai.js";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../lib/s3-client.js";
import { STORYMAKER_COMMON_PROMPT } from "../constants/storymaker-common-prompt.js";

export async function createStory(req, res) {
  const { prompt, email, userId } = req.body;

  console.log({ prompt, email, userId });

  console.log(`
    -----------------------
     Story generation start
    ------------------------`);

  const completion = await openai.chat.completions.create({
    response_format: { type: "json_object" },
    messages: [
      ...STORYMAKER_COMMON_PROMPT,
      {
        role: "user",
        content: prompt,
        // content: "Write a story about cinderella",
      },
    ],
    model: "gpt-4o-mini",
    // model: "gpt-4o",
    // model: "gpt-4-1106-preview",
    user: userId,
  });

  const gptRes = completion.choices[0].message.content;

  if (!gptRes) {
    throw new Error("No response from story generation");
  }

  console.log(JSON.parse(gptRes));

  console.log(`
    -----------------------
     Story generation end
    ------------------------`);

  const { title, story, imagePrompt } = JSON.parse(gptRes);

  const [imageBuffer, audioBuffer] = await Promise.all([
    generateImage(imagePrompt),
    generateAudio(story),
  ]);

  console.log(`
    ----------------------------------------------
    Storing image and audio to S3 started
    ----------------------------------------------`);

  const { imageUrl, audioUrl } = await uploadStoryFiles(
    imageBuffer,
    audioBuffer,
    title
  );

  console.log(`
    ----------------------------------------------
    Storing image and audio to S3 ended
    ----------------------------------------------`);

  console.log(`
      -----------------------------
      Storing data to db  started
      -----------------------------`);

  const createdStoryRes = await storymakerDB
    .insert(stories)
    .values({
      title,
      imageUrl,
      audioUrl,
      story,
      imagePrompt,
      status: "draft",
      email,
      prompt,
    })
    .returning()
    .then((res) => res[0]);

  console.log({ createdStoryRes });

  console.log(`
    -----------------------------
    Storing data to db  ended
    -----------------------------`);

  res.status(201).send(createdStoryRes);
}

const generateImage = async (imagePrompt) => {
  console.log(`
    ----------------------------
    Image Generation started
    ---------------------------`);

  if (!imagePrompt) {
    throw new Error("No image prompt");
  }

  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${imagePrompt}`,
    // prompt: `In a vibrant, colorful, cinematic illustration style: ${imagePrompt}`,
    // prompt: `In a vibrant, colorful, cinematic illustration style: Illustrate a friendly robin wearing a tiny emerald cape, with a group of woodland animals working together to build a birdhouse, in a vibrant forest setting, using a modern, simple, flat cartoon style appropriate for young children.`,
    // size: "1792x1024",
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });

  // console.log("image");
  // console.log(image);
  // const url = image.data[0].url;
  // console.log("url");
  // console.log(url);

  if (!image.data) {
    throw new Error(
      "Something went wrong while generating the image. Empty response."
    );
  }

  console.log(`
    ----------------------------
    Image Generation ended
    ---------------------------`);

  const imageUrl = image.data[0].url;

  console.log(imageUrl);

  const imageData = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    // timeout: 600000,
  });

  // eslint-disable-next-line no-undef
  const imageBuffer = Buffer.from(imageData.data);

  const webpBuffer = await sharp(imageBuffer).toFormat("webp").toBuffer();

  return webpBuffer;
};

const generateAudio = async (audioPrompt) => {
  console.log(`
    ----------------------------
    Audio Generation started
    ---------------------------`);

  if (!audioPrompt) {
    throw new Error("No audio prompt");
  }

  const audio = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: audioPrompt,
    // input: "Today is a wonderful day to build something people love!",
  });

  // eslint-disable-next-line no-undef
  const audioBuffer = Buffer.from(await audio.arrayBuffer());

  console.log(`
    ----------------------------
    Audio Generation ended
    ---------------------------`);

  return audioBuffer;
};

async function uploadStoryFiles(imageBuffer, audioBuffer, title) {
  const fileUploadStart = Date.now();
  console.log("FILES UPLOAD START");

  const [imageUrl, audioUrl] = await Promise.all([
    (async function uploadStoryImage() {
      const imageKey = `story-maker/images/web-images/${title.replaceAll(
        " ",
        "-"
      )}-${Date.now()}-webp`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: "image/webp", // Adjust this based on your image type
      };

      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      // const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${
      //   process.env.S3_BUCKET_REGION
      // }.amazonaws.com/${encodeURIComponent(imageKey)}`;
      const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${imageKey}`;

      console.log({ imageUrl });

      console.log("Image upload successful ", response);
      return imageUrl;
    })(),
    (async function uploadStoryAudio() {
      if (!audioBuffer) return null;

      const audioKey = `story-maker/audios/${title.replaceAll(
        " ",
        "-"
      )}-${Date.now()}-mpeg`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: audioKey,
        Body: audioBuffer,
        ContentType: "audio/mpeg", // Adjust this based on your image type
      };

      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      // const audioUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${
      //   process.env.S3_BUCKET_REGION
      // }.amazonaws.com/${encodeURIComponent(audioKey)}`;
      const audioUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${audioKey}`;

      console.log({ audioUrl });

      console.log("Audio upload successful ", response);
      return audioUrl;
    })(),
  ]);

  console.log({ imageUrl, audioUrl });

  const fileUploadEnd = Date.now();
  console.log(`FILES UPLOAD END. ${fileUploadEnd - fileUploadStart} ms`);

  return { imageUrl, audioUrl };
}
