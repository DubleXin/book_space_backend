import OpenAI from "openai";

export const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const AI_MODEL = "o3-mini";
