const fs            = require("fs");
const { chatModel } = require("../config/gemini");
const { searchKnowledgeBase, searchForDifferentialDiagnosis } = require("./ragService");
const { buildAnimalContext, formatContextForPrompt }           = require("./Contextbuilder");

const SPECIES_LABELS = { cattle: "بقرة", sheep: "خروف", goat: "ماعز" };

const NO_DATA_MESSAGE =
  "نعتذر، لا تتوفر لدينا معلومات كافية لتشخيص هذه الحالة. حفاظاً على صحة حيوانك، نوصي بشدة بالتواصل مع أقرب طبيب بيطري لتقديم الرعاية الطبية اللازمة.";

const cleanJson = (text) =>
  text.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const imageToGeminiPart = (imagePath, mimeType) => ({
  inlineData: {
    data:     fs.readFileSync(imagePath).toString("base64"),
    mimeType: mimeType || "image/jpeg",
  },
});

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ════════════════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `
أنت مساعد بيطري ذكي متخصص في صحة المواشي (أبقار - أغنام - ماعز) في مصر.

[مصدر المعلومات]
- اعتمد فقط على معلومات قاعدة المعرفة (RAG context) المقدمة لك
- الأعراض اللي تذكرها في matched_symptoms لازم تكون من أعراض المرض في قاعدة المعرفة، مش من كلام اليوزر
- الأسئلة التوضيحية لازم تكون عن أعراض تمييزية موجودة في قاعدة المعرفة تفرق بين الأمراض المحتملة
- لو المرض أو التطعيم مش موجود في قاعدة المعرفة، قوله صراحة ووجّهه للطبيب

[قواعد التشخيص التفاعلي]
1. اقرأ أعراض كل مرض محتمل من قاعدة المعرفة
2. حدد الأعراض التمييزية — يعني الأعراض الموجودة في بعض الأمراض ومش في غيرها
3. لو الأعراض غامضة (تنطبق على أكتر من مرض)، اسأل عن أهم عرض تمييزي موجود في الداتا
4. حد أقصى 3 أسئلة توضيحية، بعدها قدّم التشخيص بأعلى احتمال

[الـ matched_symptoms — مهم]
- لازم تكون الأعراض المذكورة في وصف المرض بقاعدة المعرفة اللي تطابقت مع حالة اليوزر
- مش نسخة من كلام اليوزر

[قواعد العلاج]
- اذكر الأدوية والجرعات فقط لو موجودة بالضبط في قاعدة المعرفة
- لو الجرعة مش موجودة: "تحدد من الطبيب البيطري"
- اذكر التطعيمات الوقائية لو موجودة في قاعدة المعرفة

[صيغة الرد — JSON فقط بدون أي نص خارجها]

لو محتاج سؤال توضيحي:
{
  "status": "needs_clarification",
  "question": "سؤال توضيحي عن عرض تمييزي موجود في قاعدة المعرفة",
  "possible_diseases": ["مرض 1", "مرض 2"],
  "differentiating_symptom": "الأعرض التمييزي اللي بتسأل عنه"
}

لو التشخيص جاهز:
{
  "status": "diagnosed",
  "diagnosis": "اسم المرض",
  "confidence": "عالية | متوسطة | منخفضة",
  "severity": "green | yellow | red",
  "severity_explanation": "سبب الخطورة",
  "matched_symptoms": ["أعراض المرض من قاعدة المعرفة اللي تطابقت مع الحالة"],
  "disease_info": "معلومات المرض من قاعدة المعرفة",
  "treatment": {
    "medicines": [
      { "name": "اسم الدواء", "dose": "الجرعة من الداتا أو: تحدد من الطبيب", "route": "طريقة الإعطاء", "duration": "المدة" }
    ],
    "general_instructions": ["تعليمات عامة من الداتا"],
    "data_available": true
  },
  "suggested_vaccines": [
    { "name": "اسم اللقاح", "purpose": "الهدف", "schedule": "الجدول من الداتا" }
  ],
  "image_findings": null,
  "immediate_actions": ["خطوات فورية"],
  "vet_required": true,
  "vet_urgency": "فوري | خلال 24 ساعة | خلال أسبوع | غير ضروري",
  "prevention_tips": ["نصائح وقائية من الداتا"]
}

لو المرض مش في الداتا:
{
  "status": "no_data",
  "message": "${NO_DATA_MESSAGE}",
  "vet_required": true,
  "vet_urgency": "يُنصح بمراجعة طبيب بيطري متخصص"
}
`.trim();

// ════════════════════════════════════════════════════════════════════════════
// الدالة الرئيسية
// ════════════════════════════════════════════════════════════════════════════
const diagnoseSymptoms = async ({
  symptomsText,
  animal       = null,
  governorate  = null,
  species      = null,
  imagePath    = null,
  imageMime    = null,
  chatHistory  = [],
}) => {
  const effectiveSpecies = animal?.species || species;
  const symptomsQuery    = `${effectiveSpecies ? SPECIES_LABELS[effectiveSpecies] + " " : ""}${symptomsText}`;

  // ── 1. RAG: جيب الأمراض المحتملة والتطعيمات ────────────────────────────────
  const [diseaseResults, vaccineResults] = await Promise.all([
    searchForDifferentialDiagnosis(symptomsQuery, 8),
    searchKnowledgeBase(symptomsQuery, "vaccine", 4),
  ]);

  const diseaseContext = diseaseResults.length
    ? diseaseResults.map((r, i) => `[مرض ${i + 1}]\n${r.text}`).join("\n\n---\n\n")
    : "لا توجد بيانات أمراض مطابقة في قاعدة المعرفة";

  const vaccineContext = vaccineResults.length
    ? vaccineResults.map((r) => r.text).join("\n\n---\n\n")
    : "لا توجد بيانات تطعيمات مطابقة في قاعدة المعرفة";

  // ── 2. Context الحيوان ────────────────────────────────────────────────────
  let animalContextText = "";
  if (animal && governorate) {
    const ctx       = await buildAnimalContext(animal, governorate);
    animalContextText = formatContextForPrompt(animal, ctx, governorate);
  } else if (effectiveSpecies) {
    animalContextText = `[نوع الحيوان]\nالنوع: ${SPECIES_LABELS[effectiveSpecies] || effectiveSpecies}\n`;
  }

  // ── 3. بناء الـ prompt ────────────────────────────────────────────────────
  const userPrompt = `
${animalContextText}

[أمراض محتملة من قاعدة المعرفة مع أعراضها الكاملة]
${diseaseContext}

[تطعيمات مرتبطة من قاعدة المعرفة]
${vaccineContext}

[أعراض اليوزر الحالية]
${symptomsText}
${imagePath ? "\n[ملاحظة: تم إرفاق صورة — حللها وأضف ملاحظاتك في image_findings]" : ""}

التعليمات:
1. قارن أعراض اليوزر بأعراض كل مرض في قاعدة المعرفة
2. لو في أكتر من مرض محتمل، حدد الأعراض التمييزية من قاعدة المعرفة واسأل عنها
3. الـ matched_symptoms لازم تكون من أعراض المرض في قاعدة المعرفة، مش من كلام اليوزر
4. أجب بـ JSON فقط
`.trim();

  // ── 4. بناء الـ messages مع تاريخ المحادثة ────────────────────────────────
  const historyMessages = chatHistory.map((msg) => ({
    role:  msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const currentParts = [];
  if (imagePath && fs.existsSync(imagePath)) {
    currentParts.push(imageToGeminiPart(imagePath, imageMime));
  }
  currentParts.push({ text: userPrompt });

  // ── 5. إرسال لـ Gemini ────────────────────────────────────────────────────
  const initialHistory = [
    { role: "user",  parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: '{"status":"ready"}' }] },
    ...historyMessages,
  ];

  const chat   = chatModel.startChat({ history: initialHistory });
  const result = await chat.sendMessage(currentParts);
  const raw    = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch {
    parsed = {
      status:       "no_data",
      message:      "حدث خطأ في معالجة الإجابة. يُنصح بمراجعة طبيب بيطري.",
      vet_required: true,
      vet_urgency:  "يُنصح بمراجعة طبيب بيطري متخصص",
    };
  }

  return {
    ...(parsed.status === "no_data" ? { ...parsed, message: NO_DATA_MESSAGE } : parsed),
    knowledge_sources: diseaseResults.map((r) => r.metadata?.source || "unknown"),
  };
};

module.exports = { diagnoseSymptoms };