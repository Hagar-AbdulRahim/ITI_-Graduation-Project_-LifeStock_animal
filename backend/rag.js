require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} = require("@langchain/google-genai");

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const embeddingModelName =
  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";

if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────
const llm = new ChatGoogleGenerativeAI({
  model: modelName,
  apiKey,
});

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model: embeddingModelName,
  apiKey,
});

// ─────────────────────────────────────────────
// MONGO
// ─────────────────────────────────────────────
const mongoClient = new MongoClient(process.env.MONGO_URI);

const DB_NAME = "LivestockHealthPlatform";
const COLLECTION = "knowledgechunks";

const getCollection = async () => {
  await mongoClient.connect();
  return mongoClient.db(DB_NAME).collection(COLLECTION);
};

const getVectorStore = async () => {
  const collection = await getCollection();
  return new MongoDBAtlasVectorSearch(embeddingModel, {
    collection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  });
};

// ─────────────────────────────────────────────
// WHISPER (GROQ)
// ─────────────────────────────────────────────
const transcribeAudio = async (filePath) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const result = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    language: "ar",
  });

  return result.text;
};

// ─────────────────────────────────────────────
// MULTER (FIXED - NO FILTER CRASH)
// ─────────────────────────────────────────────
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "./uploads/audio";
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
    },
  }),

  // 🔥 مهم: لا تمنع الملفات هنا نهائيًا
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },

  limits: { fileSize: 25 * 1024 * 1024 },
});

const mixedUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isAudio = file.mimetype?.startsWith("audio");
      const dir = isAudio ? "./uploads/audio" : "./uploads/images";
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const safeUnlink = (file) => {
  if (file && fs.existsSync(file)) {
    fs.unlink(file, () => {});
  }
};

const formatAnswer = (text) =>
  text.replace(/\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();

const getRagContext = async (query) => {
  const store = await getVectorStore();
  const results = await store.similaritySearchWithScore(query, 4);

  return results
    .filter(([, score]) => score > 0.6)
    .map(([doc]) => doc.pageContent)
    .join("\n\n---\n\n");
};

// ─────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────
const buildDiagnosisPrompt = (q, context = "", animal = {}) => `
طبيب بيطري.

النوع: ${animal?.species || "غير محدد"}

الأعراض:
${q}

السياق:
${context || "لا يوجد"}
`;

const buildImagePrompt = (q, context = "") => `
طبيب بيطري متخصص في تحليل الصور.

${q}

السياق:
${context || "لا يوجد"}
`;

// ─────────────────────────────────────────────
// STORE PDF
// ─────────────────────────────────────────────
app.post("/store", async (req, res) => {
  try {
    const file = req.body.filepath;

    // ── التحقق من وجود المسار ────────────────────────────────────────────────
    if (!file) {
      return res.status(400).json({ error: "filepath مطلوب" });
    }

    if (!fs.existsSync(file)) {
      return res.status(400).json({ error: `الملف غير موجود: ${file}` });
    }

    console.log("📄 Loading:", file);
    const loader = new PDFLoader(file);
    const docs   = await loader.load();
    console.log(`✅ Loaded ${docs.length} pages`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize:    800,
      chunkOverlap: 150,
    });

    const chunks = await splitter.splitDocuments(docs);
    console.log(`📦 Chunks: ${chunks.length}`);

    const collection = await getCollection();

    // ── حذف الـ chunks القديمة لنفس الملف بس (مش كل الـ collection) ──────────
    const filename = path.basename(file);
    await collection.deleteMany({ "metadata.source": file });
    console.log(`🗑️  Cleared old chunks for: ${filename}`);

    await MongoDBAtlasVectorSearch.fromDocuments(chunks, embeddingModel, {
      collection,
      indexName:    "vector_index",
      textKey:      "text",
      embeddingKey: "embedding",
    });

    console.log(`✅ Stored ${chunks.length} chunks for: ${filename}`);
    res.json({ success: true, file: filename, chunks: chunks.length });
  } catch (e) {
    console.error("store error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const result = await llm.invoke(req.body.prompt);
    res.json({ answer: formatAnswer(result.content) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// ANALYZE (FIXED 100%)
// ─────────────────────────────────────────────
app.post(
  "/analyze",
  mixedUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    const image = req.files?.image?.[0];
    const audio = req.files?.audio?.[0];

    try {
      let textPrompt = req.body.prompt || "";
      let audioText = "";

      if (audio) {
        audioText = await transcribeAudio(audio.path);
      }

      const combined = [textPrompt, audioText].filter(Boolean).join("\n");

      const rag = combined ? await getRagContext(combined) : "";

      const question =
        combined || "حلل الصورة من منظور طبي بيطري";

      const prompt = image
        ? buildImagePrompt(question, rag)
        : buildDiagnosisPrompt(question, rag);

      let imagePart = [];

      if (image) {
        const base64 = fs.readFileSync(image.path).toString("base64");

        imagePart = [
          {
            type: "image_url",
            image_url: `data:${image.mimetype};base64,${base64}`,
          },
        ];
      }

      const response = await llm.invoke([
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imagePart,
          ],
        },
      ]);

      res.json({
        success: true,
        answer: formatAnswer(response.content),
        hasImage: !!image,
        hasAudio: !!audio,
        transcribed: audioText || null,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      safeUnlink(image?.path);
      safeUnlink(audio?.path);
    }
  }
);

// ─────────────────────────────────────────────
// VOICE ONLY (FIXED)
// ─────────────────────────────────────────────
app.post("/voice", audioUpload.single("audio"), async (req, res) => {
  const file = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "audio required" });
    }

    const text = await transcribeAudio(file);

    const rag = await getRagContext(text);

    const prompt = buildDiagnosisPrompt(text, rag);

    const result = await llm.invoke(prompt);

    res.json({
      success: true,
      answer: formatAnswer(result.content),
      text,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    safeUnlink(file);
  }
});

// ─────────────────────────────────────────────
// SERVER
// ─────────────────────────────────────────────
app.listen(3000, () => {
  console.log("🐄 Server running on http://localhost:3000");
});