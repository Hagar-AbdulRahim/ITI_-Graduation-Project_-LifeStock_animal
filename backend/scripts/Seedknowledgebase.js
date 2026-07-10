/**
 * سكريبت بناء قاعدة المعرفة (Knowledge Base) للـ RAG
 * ──────────────────────────────────────────────────────
 * بيقرأ diseases.json و vaccines.json
 * بيحول كل عنصر لنص ثم لـ embedding عبر Google text-embedding-004
 * بيخزنهم في MongoDB في collection اسمها knowledge_base
 */

require("dotenv").config();
const mongoose = require("mongoose");

const { embeddingModel } = require("../config/gemini");
const { extractKnowledgeBaseChunks } = require("./ExtractJsonText");

const EMBEDDING_DIMENSIONS = 768;

const knowledgeBaseSchema = new mongoose.Schema({
  text:       String,
  embedding: [Number],
  metadata: {
    type:    { type: String },
    source: String,
  },
});

const KnowledgeBase = mongoose.model(
  "KnowledgeBase",
  knowledgeBaseSchema,
  "knowledge_base"
);

// إعدادات التحكم في سرعة الإرسال (Rate Limiting)
const BATCH_SIZE = 5;
const DELAY_MS   = 2000; // زيادة التأخير لضمان عدم تجاوز حد الـ API
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// دالة توليد الـ Embedding مع ميزة إعادة المحاولة (Retry Logic)
const generateEmbeddingWithRetry = async (text, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await embeddingModel.embedQuery(text.trim());
    } catch (err) {
      // إذا كان الخطأ هو 429 (تجاوز الحد) سننتظر ثم نحاول مجدداً
      if (err.status === 429 && i < retries - 1) {
        const waitTime = (i + 1) * 3000; 
        console.log(`⚠️ تجاوزت حد الـ API، إعادة المحاولة بعد ${waitTime / 1000} ثواني...`);
        await sleep(waitTime);
      } else {
        throw err;
      }
    }
  }
};

const seedKnowledgeBase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ اتصل بـ MongoDB");

    await KnowledgeBase.deleteMany({});
    console.log("✓ تم مسح البيانات القديمة من knowledge_base");

    console.log("⏳ تحويل ملفات JSON وتجهيز الـ chunks...");
    const chunks = await extractKnowledgeBaseChunks();
    console.log(`✓ إجمالي الـ chunks: ${chunks.length}`);

    let processed = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const docs = await Promise.all(
        batch.map(async (chunk) => {
          const embedding = await generateEmbeddingWithRetry(chunk.text);
          return {
            text:      chunk.text,
            embedding,
            metadata:  { type: chunk.type, source: chunk.source },
          };
        })
      );

      await KnowledgeBase.insertMany(docs);
      processed += docs.length;
      console.log(`  [${processed}/${chunks.length}] تمت معالجة دفعة...`);

      // تأخير بسيط بين كل دفعة وأخرى
      if (i + BATCH_SIZE < chunks.length) await sleep(DELAY_MS);
    }

    console.log("\n✅ تم بناء قاعدة المعرفة بنجاح!");
    console.log(`📊 الإجمالي: ${processed} chunk مخزن مع embeddings`);
  } catch (err) {
    console.error("❌ خطأ فادح أثناء التغذية:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("✓ تم إغلاق الاتصال بقاعدة البيانات.");
  }
};

seedKnowledgeBase();