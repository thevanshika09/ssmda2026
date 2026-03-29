import "dotenv/config";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const API_KEY: string | undefined = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateSummary(promptText: string): Promise<string> {
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const result = await model.generateContent(promptText);
  const response = await result.response;
  return response.text();
}

export default generateSummary;
