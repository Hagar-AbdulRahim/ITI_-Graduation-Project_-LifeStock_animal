const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
});

const llm = new ChatGoogleGenerativeAI({
  model:       process.env.GEMINI_MODEL || "gemini-1.5-flash",
  apiKey:      process.env.GEMINI_API_KEY,
  temperature: 0.4,
});

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model:  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

const CHAT_MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

module.exports = { genAI, chatModel, llm, embeddingModel, CHAT_MODEL_NAME };