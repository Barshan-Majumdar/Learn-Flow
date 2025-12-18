import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini with dynamic key
export const getModel = (apiKey) => {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};
