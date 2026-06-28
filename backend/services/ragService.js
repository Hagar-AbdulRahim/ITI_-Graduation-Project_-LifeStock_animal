const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MongoClient }                  = require("mongodb");

// ── نفس الـ client بتاع rag.js ────────────────────────────────────────────────
const mongoClient    = new MongoClient(process.env.MONGO_URI);
const DB_NAME        = "LivestockHealthPlatform";
const COLLECTION = "knowledge_base"; // نفس الـ collection اللي rag.js بيخزن فيها

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model:  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

// ── تحويل نص لـ embedding (تم تصحيحها هنا لتتوافق مع LangChain) ───────────────
const embedQuery = async (text) => {
  // LangChain تستخدم دالة embedQuery(text) وتُرجع الـ array مباشرة
  const embedding = await embeddingModel.embedQuery(text.trim());
  return embedding;
};

// ── البحث في الـ Knowledge Base ───────────────────────────────────────────────
const searchKnowledgeBase = async (queryText, type = null, limit = 4) => {
  const queryEmbedding = await embedQuery(queryText);

  await mongoClient.connect();
  const collection = mongoClient.db(DB_NAME).collection(COLLECTION);

  const pipeline = [
    {
      $vectorSearch: {
        index:         "vector_index",
        path:          "embedding",
        queryVector:   queryEmbedding,
        numCandidates: 50,
        limit:         limit * 2,
      },
    },
    {
      $project: {
        text:     1,
        metadata: 1,
        score:    { $meta: "vectorSearchScore" },
        _id:      0,
      },
    },
  ];

  if (type === "vaccine") {
    pipeline.push({
      $match: { "metadata.type": { $regex: "vaccine", $options: "i" } },
    });
  } else if (type === "disease") {
    pipeline.push({
      $match: { "metadata.type": { $regex: "disease", $options: "i" } },
    });
  }

  pipeline.push({ $limit: limit });

  const results = await collection.aggregate(pipeline).toArray();

  // ── تأمين النتايج من undefined metadata ──────────────────────────────────
  return results.map((r) => ({
    text:     r.text || "",
    metadata: r.metadata || { type: "unknown", source: "unknown" },
    score:    r.score || 0,
  }));
};

module.exports = { searchKnowledgeBase, embedQuery };