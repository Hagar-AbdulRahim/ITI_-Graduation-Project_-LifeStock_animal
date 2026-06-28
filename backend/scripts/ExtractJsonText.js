/**
 * استخراج وتحويل بيانات الأمراض من JSON لقطع نصية (chunks) جاهزة للـ RAG
 * ──────────────────────────────────────────────────────────────────────────
 * يُستخدم من Seedknowledgebase.js فقط (وقت بناء/إعادة بناء قاعدة المعرفة)
 *
 * الملفات المتوقعة داخل knowledge-base/:
 *   - diseases.json  → type: "disease"
 *   - vaccines.json  → type: "vaccine"  (اختياري)
 */

const fs   = require("fs");
const path = require("path");

const KB_DIR = path.join(__dirname, "..", "knowledge-base");

const JSON_SOURCES = [
  { filename: "diseases.json", type: "disease"  },
  { filename: "vaccines.json", type: "vaccine"  },
];

/**
 * يحول مرض واحد (object) لنص واضح يفهمه الـ embedding model
 * كل حقل بيتحول لجملة عربية طبيعية بدل ما يبقى raw JSON
 */
const diseaseToText = (disease) => {
  const lines = [];

  if (disease.disease_name)
    lines.push(`المرض: ${disease.disease_name}`);

  if (disease.scientific_name)
    lines.push(`الاسم العلمي: ${disease.scientific_name}`);

  if (disease.type)
    lines.push(`نوع المرض: ${disease.type}`);

  if (disease.affected_species?.length)
    lines.push(`الحيوانات المصابة: ${disease.affected_species.join("، ")}`);

  if (disease.symptoms?.length)
    lines.push(`الأعراض: ${disease.symptoms.join("، ")}`);

  if (disease.diagnosis)
    lines.push(`التشخيص: ${disease.diagnosis}`);

  if (disease.treatment)
    lines.push(`العلاج: ${disease.treatment}`);

  if (disease.prevention)
    lines.push(`الوقاية: ${disease.prevention}`);

  return lines.join("\n");
};

/**
 * يحول تطعيم واحد (object) لنص واضح
 */
const vaccineToText = (vaccine) => {
  const lines = [];

  if (vaccine.vaccine_name || vaccine.name)
    lines.push(`اللقاح: ${vaccine.vaccine_name || vaccine.name}`);

  if (vaccine.disease_name || vaccine.disease)
    lines.push(`يقي من: ${vaccine.disease_name || vaccine.disease}`);

  if (vaccine.affected_species?.length)
    lines.push(`الحيوانات: ${vaccine.affected_species.join("، ")}`);

  if (vaccine.schedule || vaccine.dose_schedule)
    lines.push(`الجدول: ${vaccine.schedule || vaccine.dose_schedule}`);

  if (vaccine.notes)
    lines.push(`ملاحظات: ${vaccine.notes}`);

  return lines.join("\n");
};

const extractKnowledgeBaseChunks = async () => {
  const allChunks = [];

  for (const { filename, type } of JSON_SOURCES) {
    const filePath = path.join(KB_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  الملف غير موجود: ${filePath} — تم تخطيه`);
      continue;
    }

    const raw  = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      console.warn(`⚠️  ${filename} مش array — تم تخطيه`);
      continue;
    }

    const converter = type === "vaccine" ? vaccineToText : diseaseToText;

    data.forEach((item, index) => {
      const text = converter(item).trim();
      if (text.length > 20) {
        allChunks.push({ text, type, source: filename });
      } else {
        console.warn(`  ⚠️  عنصر ${index + 1} في ${filename} فاضي تقريباً — تم تخطيه`);
      }
    });

    console.log(`  ${filename}: تم تحويل ${data.length} عنصر لـ ${allChunks.filter(c => c.source === filename).length} chunk`);
  }

  if (allChunks.length === 0) {
    throw new Error(
      `لم يتم العثور على أي بيانات في ${KB_DIR}. تأكد من وجود diseases.json هناك.`
    );
  }

  return allChunks;
};

module.exports = { extractKnowledgeBaseChunks };
