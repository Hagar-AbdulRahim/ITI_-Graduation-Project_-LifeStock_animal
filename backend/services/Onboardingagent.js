const { genAI, CHAT_MODEL_NAME } = require("../config/gemini");
const { searchKnowledgeBase }    = require("./ragService");

const SPECIES_LABELS = { cattle: "بقرة", sheep: "خروف", goat: "ماعز" };

const stripMarkdownFences = (text) =>
  text.trim()
    .replace(/^```(json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const toGeminiHistory = (conversationHistory) => {
  const filtered = conversationHistory.filter((msg, idx) => {
    if (idx === 0 && msg.role === "assistant") return false;
    return true;
  });
  return filtered.map((msg) => ({
    role:  msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
};

const buildSystemPrompt = (animal, vaccineContext, diseaseContext) => {
  const speciesAr  = SPECIES_LABELS[animal.species] || animal.species;
  const ageText    = animal.age_value
    ? `${animal.age_value} ${animal.age_unit === "months" ? "شهر" : "سنة"}`
    : "غير محدد";
  const weightText = animal.weight_kg ? `${animal.weight_kg} كغ` : "غير محدد";
  const breedText  = animal.breed     || "غير محدد";
  const genderText = animal.gender === "male" ? "ذكر" : animal.gender === "female" ? "أنثى" : "غير محدد";

  return `
أنت مساعد بيطري ذكي تساعد مزارعاً في تسجيل التاريخ المرضي للحيوان الجديد.

[بيانات الحيوان — لا تسأل عنها]
- النوع: ${speciesAr}
- رقم الوسم: ${animal.tag_number || "غير محدد"}
- الجنس: ${genderText}
- العمر: ${ageText}
- الوزن: ${weightText}
- السلالة: ${breedText}

[معلومات الأمراض من قاعدة المعرفة — استخدمها للتوجيه]
${diseaseContext || "لا توجد بيانات أمراض في قاعدة المعرفة"}

[معلومات اللقاحات من قاعدة المعرفة — استخدمها للاقتراحات]
${vaccineContext || "لا توجد بيانات لقاحات في قاعدة المعرفة"}

[الـ Flow المطلوب بالترتيب]

الخطوة 1: اسأل هل الحيوان أصيب بأي مرض قبل كده؟

--- لو قال "لا" أو انتهت الأمراض: انتقل للخطوة الأخيرة (الملخص النهائي) ---

--- لو قال "أيوه" أو ذكر مرض: اتبع الخطوات دي لكل مرض ---

الخطوة 2: لو ذكر مرض:
  أ. اعرض عليه الأعراض الشائعة للمرض ده من قاعدة المعرفة وسأله: "هل الحيوان كان عنده الأعراض دي؟"
  ب. اسأله: "إمتى تقريباً كان المرض ده؟"
  ج. اسأله: "هل الحيوان خد علاج وقتها؟ وإيه اسم الدواء لو تعرف؟"
  د. اسأله: "هل شفي تماماً ولا في أعراض لسه موجودة؟"

الخطوة 3: لو المرض له لقاح وقائي في قاعدة المعرفة:
  أ. أخبره إن المرض ده له لقاح وقائي من قاعدة المعرفة
  ب. قوله هل اللقاح ده دوري (وكل كام شهر) أو مرة واحدة
  ج. اسأله: "هل الحيوان خد لقاح [اسم اللقاح] قبل كده؟"
  - لو "أيوه": اسأله إمتى آخر جرعة — سجّله كـ is_first_dose: false
  - لو "لا": سأله هل يريد إضافته لسجل الحيوان كتطعيم مجدول؟
    * لو وافق: اسأله متى يريد تحديد موعد أول جرعة، واشرح له:
      - نوع اللقاح (دوري/مرة واحدة)
      - لو دوري: كل كام شهر بيتكرر
      - قوله إن المنصة هتذكره بالموعد
    * سجّله كـ is_first_dose: true بالموعد اللي اختاره

الخطوة 4: بعد الانتهاء من مرض واحد:
  اسأله: "هل في مرض تاني حصل مع الحيوان قبل كده؟"
  - لو "أيوه": ارجع للخطوة 2 مع المرض الجديد
  - لو "لا": انتقل للخطوة الأخيرة

الخطوة الأخيرة: الملخص النهائي
  لخّص كل المعلومات اللي جمعتها:
  - الأمراض وأعراضها والعلاج
  - اللقاحات المسجلة (أخذها + المجدولة)
  واطلب تأكيده

[قواعد مهمة]
- سؤال واحد في كل رسالة
- لو المرض مش في قاعدة المعرفة: سجّل المعلومات من كلام المزارع بدون إضافة أعراض من عندك
- لو اللقاح مش في قاعدة المعرفة: مش لازم تقترحه
- تكلم بعربية مصرية بسيطة ومباشرة

[صيغة الرد النهائي — بعد التأكيد فقط]
FINAL_JSON:{
  "conversation_complete": true,
  "medical_history": [
    {
      "disease_or_symptom": "اسم المرض",
      "symptoms_from_rag": ["أعراض من قاعدة المعرفة ظهرت على الحيوان"],
      "approximate_date": "YYYY-MM-DD أو وصف تقريبي",
      "treatment": "الدواء أو العلاج أو null",
      "recovered": true,
      "notes": ""
    }
  ],
  "vaccinations": [
    {
      "vaccine_name": "اسم اللقاح",
      "vaccine_type": "periodic أو emergency",
      "is_first_dose": true أو false,
      "last_date": "YYYY-MM-DD أو null لو أول جرعة",
      "scheduled_date": "YYYY-MM-DD لو مجدول مستقبلي — وإلا null",
      "period_months": 6,
      "from_rag": true,
      "notes": ""
    }
  ],
  "summary_message": "ملخص ودود لكل اللي تم تسجيله"
}
`.trim();
};

const continueOnboardingConversation = async (
  animal,
  conversationHistory = [],
  userMessage = null
) => {
  // ── جيب الـ context من الـ RAG في أول استدعاء فقط ─────────────────────────
  let vaccineContext  = "";
  let diseaseContext  = "";

  if (conversationHistory.length === 0) {
    try {
      const speciesAr = SPECIES_LABELS[animal.species];
      const query     = `أمراض ${speciesAr} الشائعة وأعراضها ولقاحاتها`;

      const [vaccineResults, diseaseResults] = await Promise.all([
        searchKnowledgeBase(query, "vaccine", 8),
        searchKnowledgeBase(query, "disease", 8),
      ]);

      vaccineContext = vaccineResults.map((r) => r.text).join("\n\n---\n\n");
      diseaseContext = diseaseResults.map((r) => r.text).join("\n\n---\n\n");
    } catch (err) {
      console.warn("RAG search failed:", err.message);
    }
  }

  // ── بناء الـ system prompt ────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(animal, vaccineContext, diseaseContext);

  const model = genAI.getGenerativeModel({
    model:             CHAT_MODEL_NAME,
    systemInstruction: systemPrompt,
  });

  const messageToSend =
    conversationHistory.length === 0 && !userMessage
      ? "ابدأ المحادثة واسأل المزارع أول سؤال عن التاريخ المرضي للحيوان."
      : userMessage;

  if (!messageToSend || typeof messageToSend !== "string") {
    throw new Error("لا يمكن إرسال رسالة فارغة");
  }

  const chat   = model.startChat({ history: toGeminiHistory(conversationHistory) });
  const result = await chat.sendMessage(messageToSend);
  const assistantReply = result.response.text().trim();

  const updatedHistory = [
    ...conversationHistory,
    ...(userMessage ? [{ role: "user", content: userMessage }] : []),
    { role: "assistant", content: assistantReply },
  ];

  // ── هل المحادثة خلصت؟ ────────────────────────────────────────────────────
  if (assistantReply.includes("FINAL_JSON:")) {
    const jsonStr = stripMarkdownFences(
      assistantReply.split("FINAL_JSON:")[1]
    );

    let extractedData;
    try {
      extractedData = JSON.parse(jsonStr);
    } catch {
      return {
        reply:         "حصل خطأ بسيط في التلخيص، هل يمكنك تأكيد إن المعلومات صحيحة؟",
        isComplete:    false,
        extractedData: null,
        updatedHistory,
      };
    }

    return {
      reply:         extractedData.summary_message,
      isComplete:    true,
      extractedData,
      updatedHistory,
    };
  }

  return {
    reply:         assistantReply,
    isComplete:    false,
    extractedData: null,
    updatedHistory,
  };
};

module.exports = { continueOnboardingConversation };