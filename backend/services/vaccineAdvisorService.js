/**
 * مستشار اللقاحات الذكي
 * بيجيب توصيات لقاحات حقيقية من الـ RAG (vaccines.json) + Gemini
 */
const { searchKnowledgeBase } = require("./ragService");
const { chatModel }           = require("../config/gemini");

const SPECIES_LABELS = { cattle: "أبقار", sheep: "أغنام", goat: "ماعز" };

const SYSTEM_PROMPT = `
أنت مستشار بيطري متخصص في جداول التحصينات للمواشي في مصر.
مهمتك تقديم توصيات لقاحات واضحة ومحددة بناءً على:
- نوع الحيوان
- عمره بالأشهر
- اللقاحات المتاحة في قاعدة المعرفة

قواعد مهمة:
1. اعتمد فقط على اللقاحات الموجودة في الـ context — لا تخترع لقاحات غير موجودة
2. رتب التوصيات حسب الأولوية (الأعلى أولاً)
3. الأولوية: "عالية جداً" أو "عالية" أو "متوسطة"
4. اذكر الجرعة وطريقة الإعطاء من المصدر بالضبط
5. أجب فقط بـ JSON صالح بدون أي نص خارجه وبدون markdown

الصيغة المطلوبة بالضبط:
{
  "summary": "ملخص قصير بالعربية عن أهم التحصينات لهذا النوع وهذا العمر",
  "recommendations": [
    {
      "name": "اسم اللقاح",
      "timing": "كل 6 أشهر / سنوياً / مرة واحدة",
      "priority": "عالية جداً / عالية / متوسطة",
      "notes": "ملاحظة مختصرة عن أهمية اللقاح",
      "dose": "الجرعة وطريقة الإعطاء"
    }
  ]
}
`.trim();

const getVaccineRecommendations = async ({ species, age_months }) => {
  const speciesLabel = SPECIES_LABELS[species] || species;
  const query = `لقاحات وتطعيمات ${speciesLabel} عمر ${age_months} شهر`;

  // جيب اللقاحات المناسبة من الـ RAG
  const vaccineResults = await searchKnowledgeBase(query, "vaccine", 8);

  if (!vaccineResults.length) {
    throw new Error("لا توجد بيانات لقاحات في قاعدة المعرفة");
  }

  const vaccineContext = vaccineResults.map((r) => r.text).join("\n\n---\n\n");

  const userPrompt = `
نوع الحيوان: ${speciesLabel}
العمر: ${age_months} شهر

اللقاحات المتاحة في قاعدة المعرفة:
${vaccineContext}

بناءً على المعلومات أعلاه، قدم توصيات اللقاحات المناسبة لهذا الحيوان بصيغة JSON فقط.
`.trim();

  const result = await chatModel.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userPrompt },
  ]);

  const rawText = result.response.text()
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const recommendations = JSON.parse(rawText);
  return recommendations;
};

module.exports = { getVaccineRecommendations };
