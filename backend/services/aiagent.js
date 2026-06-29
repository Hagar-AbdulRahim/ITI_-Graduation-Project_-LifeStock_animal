/**
 * تنفيذ دالة async مع إعادة محاولة تلقائية عند 503 (ضغط مؤقت على سيرفرات جوجل)
 * بتجرب 3 مرات بحد أقصى مع تأخير متزايد (1s, 2s, 4s) قبل الاستسلام
 *
 * @param {Function} fn - الدالة المطلوب تنفيذها (لازم ترجع Promise)
 * @param {number} retries - عدد المحاولات المتبقية
 * @param {number} delayMs - مدة الانتظار الحالية بالمللي ثانية
 */
const withRetry = async (fn, retries = 2, delayMs = 1000) => {
  try {
    return await fn();
  } catch (err) {
    const isOverloaded = err?.status === 503 || /503|overloaded|high demand/i.test(err?.message || "");
    if (isOverloaded && retries > 0) {
      console.warn(`⏳ Gemini مزنوقة (503) — إعادة محاولة بعد ${delayMs}ms... (متبقي ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
};

const fs = require("fs");
const { chatModel, llm } = require("../config/gemini");
const { searchKnowledgeBase } = require("./ragService");
const { buildAnimalContext, formatContextForPrompt } = require("./Contextbuilder");

const VISION_PROMPT = `
أنت مساعد بصري متخصص في وصف الأعراض الظاهرة على المواشي (أبقار - أغنام - ماعز) من الصور.

مهمتك فقط وصف ما تراه في الصورة بدقة — وليس تشخيص المرض.

اكتب وصفاً موجزاً بالعربية لما تراه في الصورة، يشمل (لو موجود):
- مكان الإصابة أو العرض الظاهر في الجسم
- لون أو شكل أي تورم، جرح، طفح جلدي، إفرازات
- وضعية الحيوان أو حالته العامة الظاهرة
- أي علامة غير طبيعية أخرى

لا تذكر تشخيصاً أو اسم مرض. فقط وصف بصري دقيق ومباشر في فقرة واحدة قصيرة.
`.trim();

/**
 * تحليل صورة الحالة عبر Gemini Vision — تستخرج وصفاً نصياً للأعراض الظاهرة
 * (image_findings) ليُستخدم بعد ذلك كمدخل إضافي في diagnoseSymptoms
 *
 * @param {string} imagePath - مسار الصورة على السيرفر (req.file.path)
 * @param {string} mimeType - نوع الملف (req.file.mimetype)
 * @returns {Promise<string>} وصف نصي للأعراض الظاهرة في الصورة
 */
const analyzeImage = async (imagePath, mimeType) => {
  const base64Image = fs.readFileSync(imagePath).toString("base64");

  const response = await withRetry(() =>
    llm.invoke([
      {
        role: "user",
        content: [
          { type: "text", text: VISION_PROMPT },
          {
            type: "image_url",
            image_url: `data:${mimeType};base64,${base64Image}`,
          },
        ],
      },
    ])
  );

  return response.content.trim();
};

const SYSTEM_PROMPT = `
أنت مساعد بيطري ذكي متخصص في صحة المواشي (أبقار - أغنام - ماعز) في مصر.
مهمتك مساعدة المزارعين في تشخيص الأمراض وإعطاء النصائح البيطرية.

قواعد مهمة:
1. تكلم دائماً بعربية عامية مصرية بسيطة تناسب المزارع العادي — من غير تفخيم أو كلام رسمي زيادة عن اللزوم
2. ردودك تكون طبيعية ومباشرة — متستخدمش ألفاظ مبالغ فيها زي "يا باشا" أو "حضرتك" أو أي سرسجة
3. لا تقدم نفسك كبديل للطبيب البيطري — دائماً أوصِ بزيارة الطبيب في الحالات الخطيرة
4. حدد درجة الخطورة بوضوح: green (بسيطة) / yellow (متابعة) / red (طارئة)
5. استخدم المعلومات من قاعدة المعرفة المرفقة في الـ context
6. لو فيه بيانات عن تاريخ الحيوان المرضي وتطعيماته وأوبئة المنطقة، استخدمها لرفع دقة التشخيص
7. لو مفيش بيانات تاريخية (استشارة عامة بدون حيوان مسجل)، اعتمد على الأعراض ونوع الحيوان فقط، واذكر في إجاباتك إن تسجيل الحيوان هيخلي التشخيص أدق مستقبلاً
8. لو ذُكر في قاعدة المعرفة (الـ context) اسم تطعيم/لقاح محدد كوسيلة وقاية أو ضمن خطة العلاج لهذا المرض بالذات، اذكر اسمه نصاً بالضبط كما ورد في المصدر داخل prevention_tips، وابدأ تلك العبارة بالضبط بكلمة "تطعيم:" متبوعة باسم اللقاح (مثال: "تطعيم: لقاح الحمى القلاعية — يُعطى كل 6 أشهر"). لا تخترع اسم لقاح غير موجود في الـ context، ولو السياق لا يذكر أي تطعيم لا تضيف هذا السطر أصلاً
9. أجب فقط بصيغة JSON صالحة بدون أي نص خارجها وبدون أي رموز markdown مثل \`\`\`json، بالتنسيق التالي بالضبط:

{
  "diagnosis": "اسم المرض المحتمل بالعربي",
  "confidence": "عالية | متوسطة | منخفضة",
  "severity": "green | yellow | red",
  "severity_explanation": "سبب تحديد هذه الدرجة بجملة بسيطة",
  "matched_symptoms": ["الأعراض التي تطابقت مع التشخيص"],
  "immediate_actions": ["الخطوات الفورية المطلوبة"],
  "treatment_summary": "ملخص العلاج المقترح من الأدوية في قاعدة المعرفة",
  "vet_required": true أو false,
  "vet_urgency": "فوري | خلال 24 ساعة | خلال أسبوع | غير ضروري",
  "prevention_tips": ["نصائح وقائية للمستقبل، وفيها سطر يبدأ بـ \"تطعيم:\" لو ورد لقاح في المصدر"]
}
`.trim();

const SPECIES_LABELS = { cattle: "بقرة", sheep: "خروف", goat: "ماعز" };

/**
 * Gemini أحياناً بيرجع الـ JSON متغلف بـ ```json ... ``` حتى مع التعليمات الواضحة
 * الدالة دي بتشيل أي markdown fences قبل الـ JSON.parse
 */
const cleanJsonResponse = (text) => {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
};

/**
 * الدالة الرئيسية للتشخيص — تجمع RAG + context (لو متاح) وتستدعي Gemini
 *
 * بتشتغل في حالتين:
 * 1. حيوان مسجل (animal موجود) → بتستخدم Context-Aware الكامل (تاريخ + تطعيمات + أوبئة)
 * 2. استشارة عامة (animal = null) → بتعتمد على الأعراض ونوع الحيوان (لو محدد) بس
 *
 * @param {Object} params
 * @param {string} params.symptomsText - الأعراض كما وصفها المزارع
 * @param {Object|null} params.animal - مستند الحيوان الكامل من MongoDB، أو null لو استشارة عامة
 * @param {string|null} params.governorate - محافظة المزرعة (مطلوبة فقط لو فيه animal)
 * @param {string|null} params.species - نوع الحيوان (cattle/sheep/goat) — يُستخدم في حالة الاستشارة العامة بدل animal.species
 * @param {string} [params.imageFindings] - وصف الـ Vision AI لو فيه صورة مرفوعة
 * @returns {Object} نتيجة التشخيص بصيغة JSON منظمة
 */
const diagnoseSymptoms = async ({
  symptomsText,
  animal = null,
  governorate = null,
  species = null,
  imageFindings = null,
}) => {
  // ── 1. دمج النص مع وصف الصورة لو موجود ────────────────────────────────────
  const fullSymptomsText = imageFindings
    ? `${symptomsText}\n\nأعراض ظاهرة في الصورة: ${imageFindings}`
    : symptomsText;

  // نوع الحيوان: من الـ animal لو مسجل، أو من الـ species المُدخلة في الاستشارة العامة
  const effectiveSpecies = animal ? animal.species : species;

  // ── 2. RAG: البحث في قاعدة المعرفة — أمراض + لقاحات بشكل منفصل ──────────────
  const [diseaseResults, vaccineResults] = await Promise.all([
    searchKnowledgeBase(fullSymptomsText, "disease", 4),
    searchKnowledgeBase(fullSymptomsText, "vaccine", 2),
  ]);
  const knowledgeResults = [...diseaseResults, ...vaccineResults];
  const knowledgeContext = [
    diseaseResults.map((r) => r.text).join("\n\n---\n\n"),
    vaccineResults.length
      ? "=== لقاحات ذات صلة ===\n" + vaccineResults.map((r) => r.text).join("\n\n---\n\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // ── 3. Context-Aware: تاريخ الحيوان + تطعيمات + أوبئة (فقط لو الحيوان مسجل) ─
  let contextText;
  if (animal && governorate) {
    const animalContext = await buildAnimalContext(animal, governorate);
    contextText = formatContextForPrompt(animal, animalContext, governorate);
  } else {
    // استشارة عامة — مفيش تاريخ نربطه، نوضح نوع الحيوان فقط لو معروف
    contextText = `[نوع الاستشارة]\nاستشارة عامة بدون حيوان مسجل في المنصة.\n`;
    if (effectiveSpecies) {
      contextText += `نوع الحيوان المذكور: ${SPECIES_LABELS[effectiveSpecies] || effectiveSpecies}\n`;
    } else {
      contextText += `نوع الحيوان: غير محدد\n`;
    }
  }

  // ── 4. بناء الـ prompt الكامل ───────────────────────────────────────────────
  const userPrompt = `
معلومات بيطرية ذات صلة من قاعدة المعرفة:
${knowledgeContext}

---

${contextText}

---

[أعراض الحالة الحالية]
${fullSymptomsText}

بناءً على كل المعلومات أعلاه، قدم تشخيصك بصيغة JSON فقط كما هو محدد في التعليمات.
`.trim();

  // ── 5. استدعاء Gemini (مع إعادة محاولة تلقائية لو السيرفر مزنوق) ──────────────
  const result = await withRetry(() =>
    chatModel.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt },
    ])
  );

  const rawResponse = result.response.text();
  const diagnosis   = JSON.parse(cleanJsonResponse(rawResponse));

  return {
    diagnosis,
    rawResponse,
    knowledgeUsed: [...new Set(knowledgeResults.map((r) => r.metadata.source))],
  };
};

module.exports = { diagnoseSymptoms, analyzeImage };