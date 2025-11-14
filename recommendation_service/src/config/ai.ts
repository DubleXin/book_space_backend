import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}

export const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = "o3-mini";
