const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MongoClient }                  = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGO_URI);
const DB_NAME     = "LivestockHealthPlatform";
const COLLECTION  = "knowledge_base";

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model:  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

const embedQuery = async (text) => embeddingModel.embedQuery(text.trim());

const searchKnowledgeBase = async (queryText, type = null, limit = 4) => {
  const queryEmbedding = await embedQuery(queryText);

  await mongoClient.connect();
  const collection = mongoClient.db(DB_NAME).collection(COLLECTION);

  // numCandidates كبيرة عشان نضمن إن فيه نتايج كافية بعد الـ $match
  const numCandidates = type ? 120 : 50;

  const pipeline = [
    {
      $vectorSearch: {
        index:         "vector_index",
        path:          "embedding",
        queryVector:   queryEmbedding,
        numCandidates,
        limit:         numCandidates, // نجيب كل الـ candidates وبعدين نفلتر
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

  // الـ $match بعد $vectorSearch مباشرة وقبل $limit
  if (type === "vaccine") {
    pipeline.push({ $match: { "metadata.type": "vaccine" } });
  } else if (type === "disease") {
    pipeline.push({ $match: { "metadata.type": "disease" } });
  }

  pipeline.push({ $limit: limit });

  const results = await collection.aggregate(pipeline).toArray();

  return results.map((r) => ({
    text:     r.text || "",
    metadata: r.metadata || { type: "unknown", source: "unknown" },
    score:    r.score || 0,
  }));
};

module.exports = { searchKnowledgeBase, embedQuery };