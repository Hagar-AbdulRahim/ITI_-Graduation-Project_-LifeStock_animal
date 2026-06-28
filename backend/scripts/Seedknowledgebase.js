/**
 * سكريبت بناء قاعدة المعرفة (Knowledge Base) للـ RAG
 * ──────────────────────────────────────────────────────
 * بيقرأ diseases.json (وvaccines.json لو موجود)
 * بيحول كل عنصر لنص ثم لـ embedding عبر Google text-embedding-004
 * بيخزنهم في MongoDB في collection اسمها knowledge_base
 *
 * يشتغل مرة واحدة (أو كل ما تتغير ملفات الـ JSON)
 * تشغيل: node scripts/Seedknowledgebase.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const { embeddingModel }           = require("../config/gemini");
const { extractKnowledgeBaseChunks } = require("./ExtractJsonText");

const EMBEDDING_DIMENSIONS = 768;

const knowledgeBaseSchema = new mongoose.Schema({
  text:      String,
  embedding: [Number],
  metadata: {
    type:   { type: String },
    source: String,
  },
});

const KnowledgeBase = mongoose.model(
  "KnowledgeBase",
  knowledgeBaseSchema,
  "knowledge_base"
);

const generateEmbedding = async (text) =>
  embeddingModel.embedQuery(text.trim());

const BATCH_SIZE = 5;
const DELAY_MS   = 1200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
          const embedding = await generateEmbedding(chunk.text);
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

      if (i + BATCH_SIZE < chunks.length) await sleep(DELAY_MS);
    }

    console.log("\n✅ تم بناء قاعدة المعرفة بنجاح!");
    console.log(`📊 الإجمالي: ${processed} chunk مخزن مع embeddings`);
    console.log(`📐 أبعاد كل embedding: ${EMBEDDING_DIMENSIONS}`);
    console.log("\n⚠️  تأكد من إنشاء Vector Search Index باسم 'vector_index' في Atlas");
    console.log(`   collection: knowledge_base — path: embedding — dimensions: ${EMBEDDING_DIMENSIONS} — similarity: cosine`);
  } catch (err) {
    console.error("❌ خطأ:", err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedKnowledgeBase();
