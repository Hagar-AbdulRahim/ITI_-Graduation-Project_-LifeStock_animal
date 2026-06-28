const { genAI, CHAT_MODEL_NAME } = require("../config/gemini");
const { searchKnowledgeBase }    = require("./ragService");

const SPECIES_LABELS = { cattle: "بقرة", sheep: "خروف", goat: "ماعز" };

// ── تنظيف markdown fences من رد Gemini ───────────────────────────────────────
const stripMarkdownFences = (text) =>
  text.trim()
    .replace(/^```(json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

// ── تحويل history لصيغة Gemini ────────────────────────────────────────────────
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

// ── بناء الـ System Prompt مع بيانات الحيوان الكاملة ─────────────────────────
const buildSystemPrompt = (animal, suggestedVaccinesText) => {
  const speciesAr   = SPECIES_LABELS[animal.species] || animal.species;
  const ageText     = animal.age_value
    ? `${animal.age_value} ${animal.age_unit === "months" ? "شهر" : "سنة"}`
    : "غير محدد";
  const weightText  = animal.weight_kg ? `${animal.weight_kg} كغ` : "غير محدد";
  const breedText   = animal.breed     || "غير محدد";
  const genderText  = animal.gender === "male" ? "ذكر" : animal.gender === "female" ? "أنثى" : "غير محدد";

  return `
أنت مساعد بيطري ذكي متخصص في تهيئة بيانات المواشي في مصر.

[بيانات الحيوان المُسجَّل في المنصة — لا تسأل عنها مجدداً]
- النوع:   ${speciesAr}
- رقم الوسم: ${animal.tag_number || "غير محدد"}
- الجنس:   ${genderText}
- العمر:   ${ageText}
- الوزن:   ${weightText}
- السلالة: ${breedText}

[مهمتك]
اسأل المزارع سؤالاً واحداً فقط في كل مرة عن:
1. هل الحيوان أصيب بأي مرض قبل كده؟ (التاريخ المرضي)
2. هل أخد أي لقاحات قبل كده؟ وإيه اسمها وإمتى؟

[قواعد المحادثة]
- تكلم بعربية عامية مصرية بسيطة — من غير تفخيم أو ألقاب زي "يا حاج" أو "يا باشا" أو "حضرتك"
- ردودك تكون طبيعية ومباشرة
- لا تسأل عن العمر أو النوع أو الوزن — هي موجودة عندك بالفعل
- اسأل سؤالاً واحداً في كل مرة
- لو المزارع قال "لا" أو "مفيش"، انتقل للسؤال التالي
- بعد ما تجمع المعلومتين، لخّص واطلب تأكيد
- لما يأكد، ابدأ ردك بـ FINAL_JSON: مباشرة

[تصنيف اللقاحات]
- دوري (periodic): يتكرر بانتظام — مثل القلاعية (كل 6 أشهر)، التسمم الدموي (كل 12 شهر)
- طارئ (emergency): مرة واحدة عند الحاجة — مثل البروسيلا، لقاح عند الشراء

[اللقاحات المتاحة من قاعدة المعرفة]
${suggestedVaccinesText || "لا توجد بيانات كافية"}

[صيغة الرد النهائي — عند انتهاء المحادثة فقط]
ابدأ ردك بـ FINAL_JSON: متبوعاً مباشرة بالـ JSON:

FINAL_JSON:{
  "conversation_complete": true,
  "medical_history": [
    { "disease_or_symptom": "اسم المرض", "approximate_date": "YYYY-MM-DD أو وصف", "notes": "" }
  ],
  "vaccinations": [
    {
      "vaccine_name": "اسم اللقاح",
      "vaccination_date": "YYYY-MM-DD أو وصف",
      "vaccine_type": "periodic أو emergency",
      "period_months": 6,
      "notes": ""
    }
  ],
  "summary_message": "رسالة ودودة قصيرة تلخص ما تم تسجيله"
}

لو مفيش تاريخ مرضي أو لقاحات، رجّع arrays فاضية [].
`.trim();
};

// ── الدالة الرئيسية ───────────────────────────────────────────────────────────
const continueOnboardingConversation = async (
  animal,
  conversationHistory = [],
  userMessage = null
) => {
  // ── أول استدعاء فقط: جيب اللقاحات من RAG ────────────────────────────────
  let suggestedVaccinesText = "";
  if (conversationHistory.length === 0) {
    try {
      const speciesAr = SPECIES_LABELS[animal.species];
      const results   = await searchKnowledgeBase(
        `اللقاحات الموصى بها لـ ${speciesAr}`,
        "vaccine",
        6
      );
      suggestedVaccinesText = results.map((r) => r.text).join("\n\n");
    } catch (err) {
      console.warn("RAG search failed:", err.message);
    }
  }

  // ── بناء الـ system prompt مع بيانات الحيوان ─────────────────────────────
  const systemPrompt = buildSystemPrompt(animal, suggestedVaccinesText);

  // ── إنشاء الـ model مع الـ system prompt ─────────────────────────────────
  const model = genAI.getGenerativeModel({
    model:             CHAT_MODEL_NAME,
    systemInstruction: systemPrompt,
  });

  // ── تحديد الرسالة المرسلة ─────────────────────────────────────────────────
  const messageToSend =
    conversationHistory.length === 0 && !userMessage
      ? "ابدأ المحادثة واسأل المزارع أول سؤال."
      : userMessage;

  if (!messageToSend || typeof messageToSend !== "string") {
    throw new Error("لا يمكن إرسال رسالة فارغة");
  }

  // ── إرسال للـ Gemini ──────────────────────────────────────────────────────
  const chat   = model.startChat({ history: toGeminiHistory(conversationHistory) });
  const result = await chat.sendMessage(messageToSend);
  const assistantReply = result.response.text().trim();

  // ── تحديث الـ history ─────────────────────────────────────────────────────
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
        reply:         "حصل خطأ بسيط، هل يمكنك تأكيد إن المعلومات صحيحة؟",
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