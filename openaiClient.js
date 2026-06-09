// openaiClient.js
import OpenAI from "openai";

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export function ensureOpenAI() {
  if (!openai) {
    throw new Error("OpenAI is not configured");
  }

  return openai;
}
