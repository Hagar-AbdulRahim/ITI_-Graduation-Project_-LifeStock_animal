const { GoogleGenerativeAI } = require("@google/generative-ai");
const { CHAT_MODEL_NAME } = require("../config/gemini");
const { searchKnowledgeBase } = require("./ragService");

// ── الـ System Prompt المحسّن ────────────────────────────────────────────────
const buildSystemPrompt = (animal, ragContext) => `
أنت مساعد بيطري محترف. مهمتك هي تسجيل التاريخ المرضي والتحصينات للحيوان الجديد بدقة.

بيانات الحيوان الأساسية:
- النوع: ${animal.species === "cattle" ? "بقرة" : animal.species === "sheep" ? "خروف" : "ماعز"}
- العمر: ${animal.age_value} ${animal.age_unit === "years" ? "سنة" : "شهر"}
- رقم الوسم: ${animal.tag_number || "غير محدد"}

معلومات إرشادية (استخدمها عند ذكر مرض):
${ragContext || "لا توجد معلومات إضافية"}

قواعد العمل الصارمة:
1. استخدم لغة عربية فصحى بسيطة ومهنية.
2. لا تستخدم عبارات شخصية مثل "يا حاج" أو "يا فندم".
3. لا تذكر "قاعدة البيانات" أو "الذكاء الاصطناعي"؛ تعامل كأنك خبير بشري.
4. سؤال واحد فقط في كل رسالة.
5. لا تقترح علاجاً دوائياً، ركز فقط على التاريخ المرضي واللقاحات.
6. إذا ذكر المزارع مرضاً، اتبع الخطوات دي بالترتيب الإلزامي التالي — سؤال واحد بس في كل رسالة، ما تقفزش خطوة:
   أ. اسأله الأول: "إمتى حصلت الإصابة تقريباً؟" (عشان approximate_date).
   ب. بعدها اسأل: "الحيوان لسه مصاب بالمرض ده ولا خف/اتعالج؟" (عشان تحدد still_affected: true لو لسه مصاب، false لو خف/اتعالج).
   ج. دوّر في "معلومات إرشادية" فوق على المرض ده تحديداً:
      - لو لقيت أعراضه: اذكرها للمزارع صراحة واسأله "هل ظهرت على الحيوان أعراض زي [الأعراض من المعلومات الإرشادية]؟" للتأكد منها بدل ما تكتفي بتسجيل اسم المرض من غير تفاصيل.
      - لو مفيش أعراض ظاهرة في "معلومات إرشادية" لنفس المرض، متخترعش أعراض، كمّل عادي من غير السؤال ده.
   د. اسأل بعدها: "هل الحيوان اتطعم ضد المرض ده قبل كده ولا لأ؟"
      - لو لقيت في "معلومات إرشادية" اسم لقاح وقائي مرتبط بنفس المرض، اذكر اسمه في السؤال: "هل تلقى الحيوان لقاح [اسم اللقاح] من قبل؟"
      - لو رد بـ "أيوه/اتطعم": اسأل عن تاريخ آخر جرعة أو إذا كان يريد تسجيلها من دلوقتي.
   هـ. المعلومات الإرشادية بتتجدد كل رسالة بناءً على كل الأمراض المذكورة في المحادثة كلها، فلو مرض اتذكر قبل كده، لسه المفروض تلاقي بياناته متاحة حتى لو الرسالة الحالية مش بتذكر اسمه تاني.
7. بعد كل مرض (وبعد ما تسأل عن اللقاح المرتبط بيه لو موجود)، اسأل: "هل أُصيب الحيوان بأي أمراض أخرى؟"
8. عند الانتهاء (قول "لا"): قدم ملخصاً مهنياً واطلب التأكيد النهائي.
9. في الـ JSON النهائي، الحقل "still_affected" لازم يتاخد بالظبط من رد المزارع على سؤال "لسه مصاب ولا خف" (خطوة 6-ب) — متحطش قيمة افتراضية من عندك.

عند إنهاء المحادثة، ابدأ ردك بـ FINAL_JSON: متبوعاً بـ JSON صالح بهذا الشكل:
FINAL_JSON:{
  "conversation_complete": true,
  "medical_history": [
    {
      "disease_or_symptom": "اسم المرض",
      "approximate_date": "YYYY-MM-DD أو وصف تقريبي",
      "still_affected": true أو false,
      "confirmed_symptoms": ["أعراض"],
      "notes": "ملاحظات"
    }
  ],
  "vaccinations": [
    {
      "vaccine_name": "اسم اللقاح",
      "vaccination_type": "دوري أو مرة_واحدة",
      "revaccination_interval_months": رقم أو null,
      "last_date": "YYYY-MM-DD أو null"
    }
  ],
  "summary_message": "ملخص مهني لما تم تسجيله."
}
`.trim();

// ── دالة الجلسة الرئيسية ──────────────────────────────────────────────────────
const continueOnboardingConversation = async (animal, conversationHistory = [], userMessage = null) => {
  
  // 1. جلب السياق من الـ RAG
  // مهم: بندور بكل الأعراض/الأمراض اللي اتقالت في المحادثة لحد دلوقتي، مش بس
  // آخر رسالة، عشان لو المزارع سمّى مرض في رسالة وبعدين رد بإجابة قصيرة
  // ("من 3 شهور" مثلاً) في الرسالة اللي بعدها، الايجنت يفضل شايف بيانات
  // المرض واللقاح المرتبط بيه بدل ما يفقدها فجأة
  let ragContext = "";
  const previousUserMessages = conversationHistory
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  const accumulatedQuery = [...previousUserMessages, userMessage]
    .filter(Boolean)
    .join("، ");
  const searchQuery = accumulatedQuery || `أمراض وتطعيمات ${animal.species}`;

  try {
    const [diseaseResults, vaccineResults] = await Promise.all([
      searchKnowledgeBase(searchQuery, "disease", 3),
      searchKnowledgeBase(searchQuery, "vaccine", 3),
    ]);

    // فلتر بسيط بس مش قاسي — بنفضّل نسيب نتيجة متوسطة الصلة بدل ما السياق
    // يفضل فاضي تماماً ويخلي الايجنت "ينسى" المرض
    ragContext = [
      ...diseaseResults.filter(r => r.score > 0.3).map(r => r.text),
      ...vaccineResults.filter(r => r.score > 0.3).map(r => r.text)
    ].join("\n\n");
  } catch (err) {
    console.warn("RAG search warning:", err.message);
  }

  // 2. تنظيف الـ History لضمان أن الترتيب (user -> model)
  const history = conversationHistory.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  })).filter((m, idx, arr) => {
      // إزالة أي رسالة نموذج في البداية
      if (idx === 0 && m.role === "model") return false;
      return true;
  });

  // 3. بناء الـ Model
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL_NAME,
    systemInstruction: buildSystemPrompt(animal, ragContext),
  });

  const chatSession = model.startChat({
    history: history,
    generationConfig: { temperature: 0.3 },
  });

  // 4. إرسال الرسالة
  const firstTurn = conversationHistory.length === 0 && !userMessage;
  // لو أول استدعاء: نطلب من الـ AI يبدأ هو بالسؤال (مش المزارع)
  // لو مش أول استدعاء: نبعت رسالة المزارع الفعلية
  const messageToSend = firstTurn
    ? "ابدأ المحادثة الآن بسؤال المزارع عن التاريخ المرضي للحيوان."
    : userMessage;

  const result = await chatSession.sendMessage(messageToSend);
  const assistantReply = result.response.text().trim();

  // 5. تحديث التاريخ — في أول استدعاء مش بنضيف trigger message للـ history
  // عشان الـ AI في الاستدعاء الجاي ما يشوفش رسالة "ابدأ المحادثة" ويتوهم
  const updatedHistory = [
    ...conversationHistory,
    ...(firstTurn || !userMessage ? [] : [{ role: "user", content: userMessage }]),
    { role: "assistant", content: assistantReply },
  ];

  // 6. التعامل مع JSON النهائي
  if (assistantReply.startsWith("FINAL_JSON:")) {
    const jsonStr = assistantReply.replace("FINAL_JSON:", "").trim();
    try {
      const extractedData = JSON.parse(jsonStr);
      return {
        reply: extractedData.summary_message,
        isComplete: true,
        extractedData,
        updatedHistory,
      };
    } catch {
      return { reply: "حدث خطأ في التلخيص، هل المعلومات صحيحة؟", isComplete: false, updatedHistory };
    }
  }

  return { reply: assistantReply, isComplete: false, updatedHistory };
};

module.exports = { continueOnboardingConversation };