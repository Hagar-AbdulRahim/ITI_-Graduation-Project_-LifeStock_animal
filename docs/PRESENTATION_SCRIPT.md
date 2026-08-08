# سكريبت شرح فيتشرز مشروع LifeStock Animal

> **ملاحظة:** السكريبت ده بيشرح الفيتشرز الثلاثة الرئيسية اللي اتنفذت فعلاً في الكود — التشخيص الذكي، الـ Onboarding، وإدارة المزرعة.

---

## 🩺 Feature 1: نظام التشخيص الذكي (Smart Diagnosis System)

---

### 🎤 [المقدمة — المشكلة]

> **"تخيل إنك مزارع الساعة 2 الصبح، وعندك بقرة وحشة وملقتش دكتور بيطري. إيه اللي بتعمله؟"**
>
> ده بالظبط السيناريو اللي حلّه الـ feature ده.

---

### 📋 [الشرح التقني]

**الـ Feature بيدعم 4 طرق إدخال:**

```
نص مكتوب     →  /api/health-cases/diagnose
صوت          →  /api/health-cases/diagnose/voice
صورة         →  /api/health-cases/diagnose/image
صوت + صورة   →  /api/health-cases/diagnose/image  (نفس الـ endpoint)
```

---

#### ① تشخيص بالنص مع محادثة تفاعلية (Multi-turn Chat)

**ازاي بيشتغل:**

المزارع يكتب الأعراض، والـ AI مش بيرد بإجابة واحدة فقط — ده المزيز. الـ AI عنده قدرة يسأل المزارع أسئلة توضيحية لو الأعراض ملش كافية للتشخيص.

```javascript
// في aiagent.js — جوه الـ System Prompt
"[قواعد التشخيص التفاعلي]
1. لو الأعراض غامضة → اسأل عن أهم عرض تمييزي
2. حد أقصى 3 أسئلة توضيحية، بعدها قدّم التشخيص بأعلى احتمال"

// الـ controller بيتتبع عدد الأسئلة
const MAX_CLARIFICATION_QUESTIONS = 3;
const clarificationCount = countClarificationQuestions(sanitizedChatHistory);
```

**الـ response بييجي بشكلين:**

```json
// لو محتاج سؤال توضيحي
{ "status": "needs_clarification", "question": "هل ظهر إسهال مع الحرارة؟" }

// لو التشخيص جاهز
{
  "status": "diagnosed",
  "diagnosis": "حمى الوادي المتصدع",
  "severity": "red",
  "treatment": { "medicines": [...] },
  "vet_required": true,
  "vet_urgency": "فوري"
}
```

---

#### ② تشخيص بالصوت

**Flow كامل:**

```
Frontend: المستخدم يضغط الميكروفون
    ↓
MediaRecorder API (مدمج في المتصفح)
    ↓
Blob بصيغة audio/webm
    ↓
FormData → POST /diagnose/voice
    ↓
Backend: Multer بيحفظ الملف في uploads/audio/
    ↓
Groq SDK (Whisper Large v3) بيحول الصوت لنص عربي
    ↓
prompt خاص: "مزرعة، ماشية، أبقار، أغنام، أعراض، علاج"
    ↓
النص يروح لنفس منطق التشخيص
    ↓
الملف الصوتي يُحذف تلقائياً (fs.unlink)
    ↓
Response: { transcribed_text: "...", diagnosis: "..." }
```

> **نقطة مهمة تذكرها:**  الـ `prompt` اللي بيتبعت لـ Whisper مش فاضي — فيه كلمات بيطرية متخصصة عشان الموديل يتعرف على مصطلحات زي "حمى القلاعية" و"لقاح التحصين" بدقة أكبر.

---

#### ③ تشخيص بالصورة (Gemini Vision)

**المشكلة اللي اتحلت:**

بعض الصور بيكون الـ MIME type بتاعها غلط عند الرفع (خصوصاً `.jfif` من الموبايل). الكود بيصلح ده قبل ما يبعتها:

```javascript
// في ChatAi.js — Frontend
const mimeMap = { jfif: 'image/jpeg', jpe: 'image/jpeg', jpg: 'image/jpeg' }
const fixedFile = new File([file], file.name, { type: correctMime })
```

**الـ Backend بيحول الصورة لـ Base64 ويبعتها لـ Gemini Vision:**

```javascript
// في aiagent.js
const imageToGeminiPart = (imagePath, mimeType) => ({
  inlineData: {
    data:     fs.readFileSync(imagePath).toString("base64"),
    mimeType: mimeType || "image/jpeg",
  },
});

// بيبعت الصورة + الأعراض في نفس الرسالة لـ Gemini
const currentParts = [
  imageToGeminiPart(imagePath, imageMime),  // ← الصورة
  { text: userPrompt }                       // ← الأعراض والسياق
];
```

---

#### ④ نظام الـ RAG (Retrieval-Augmented Generation)

بدل ما الـ AI يعتمد على معرفته العامة، بيبحث أولاً في **قاعدة معرفة بيطرية متخصصة** عشان يجيب معلومات دقيقة عن الأمراض والتطعيمات في مصر.

```javascript
// في aiagent.js
const [diseaseResults, vaccineResults] = await Promise.all([
  searchForDifferentialDiagnosis(symptomsQuery, 8),  // ← 8 أمراض محتملة
  searchKnowledgeBase(symptomsQuery, "vaccine", 4),  // ← 4 تطعيمات مرتبطة
]);
```

**نتيجة التشخيص الكاملة بتتحفظ في MongoDB وبتشمل:**
- `ai_diagnosis` — اسم المرض
- `severity` — green / yellow / red  
- `matched_symptoms` — الأعراض المتطابقة من قاعدة المعرفة
- `recommended_treatment` — الأدوية والجرعات
- `vet_required` / `vet_urgency` — هل يحتاج بيطري وامتى

---

#### ⑤ الإشعار الفوري للحالات الحرجة

لو التشخيص جاب `severity = red`، السيرفر بيبعت إشعار فوري لصاحب المزرعة **قبل ما يرجع الـ response للفرونت:**

```javascript
// في Healthcase.controller.js
const notifyIfCritical = async ({ severity, ownerId, animalId, tagNumber }) => {
  if (severity !== "red" || !ownerId) return;
  await sendNotification({
    title: "⚠️ حالة حرجة",
    body:  `حيوان رقم ${tagNumber} يحتاج تدخل بيطري فوري`,
  });
};
```

---

---

## 🤝 Feature 2: الـ Onboarding الذكي بالمحادثة (AI Onboarding Agent)

---

### 🎤 [المقدمة — المشكلة]

> **"المزارع المصري مش عارف يملأ فورم طبي ضخم. إزاي نجمع تاريخ مرضي كامل لحيوان جديد من غير ما ييجي المزارع بيهرب من الموضوع كله؟"**
>
> الحل: خليناه محادثة طبيعية زي أي شات.

---

### 📋 [الشرح التقني]

#### الفكرة الكاملة:

لما المزارع يضيف حيوان جديد، بدل ما يملأ فورم معقد — المساعد الذكي بيسأله أسئلة واحدة واحدة بلغة عربية بسيطة ومهنية، ويجمع:
1. **التاريخ المرضي الكامل** — أمراض سابقة، تواريخها، الأعراض
2. **التطعيمات** — اللي اتأخدت ومواعيد اللي جاية

#### System Prompt المتطور:

الـ prompt مش عادي — فيه **خريطة قرارات كاملة** للـ AI:

```
قواعد العمل الصارمة:
1. سؤال واحد فقط في كل رسالة (مش سؤالين معاً)
2. لما المزارع يذكر مرض، اتبع الخطوات بالترتيب الإلزامي:
   أ. امتى حصلت الإصابة؟
   ب. لسه مصاب ولا خف؟
   ج. ادور في قاعدة المعرفة على أعراض المرض واسأل عنها
   د. هل اتطعم ضد المرض ده؟ (وادكر اسم اللقاح لو موجود)
3. بعد كل مرض: "هل في أمراض أخرى؟"
4. في الآخر: ملخص مهني واطلب تأكيد
```

#### الـ RAG متجدد مع كل رسالة:

```javascript
// في Onboardingagent.js
// بيجمع كل كلام اليوزر من أول المحادثة
const accumulatedQuery = [...previousUserMessages, userMessage].join("، ");

// بيبحث في قاعدة المعرفة بكل الأمراض المذكورة في المحادثة كلها
const [diseaseResults, vaccineResults] = await Promise.all([
  searchKnowledgeBase(accumulatedQuery, "disease", 3),
  searchKnowledgeBase(accumulatedQuery, "vaccine", 3),
]);
```

> **سبب كده:** لو المزارع قال "حمى" في رسالة أولى، وبعدين رد بـ "من 3 شهور" في الرسالة الجاية — الـ AI لازم يفضل شايف معلومات "حمى" وما ينساش المرض.

#### الـ FINAL_JSON — الإنهاء الذكي:

لما المحادثة تخلص، الـ AI بيولد JSON كامل:

```json
FINAL_JSON:{
  "conversation_complete": true,
  "medical_history": [
    {
      "disease_or_symptom": "حمى القلاعية",
      "approximate_date": "2024-06-01",
      "still_affected": false,
      "confirmed_symptoms": ["تقرحات فموية", "عرج"],
      "notes": "تعافى خلال أسبوعين"
    }
  ],
  "vaccinations": [
    {
      "vaccine_name": "لقاح حمى القلاعية",
      "administered": true,
      "last_date": "2024-05-01",
      "scheduled_date": null
    }
  ]
}
```

#### الـ Confirm — الحفظ الذكي في قاعدة البيانات:

بعد تأكيد المزارع، `POST /onboarding/:animalId/confirm` بيحفظ:

```javascript
// في Onboarding.controller.js
// 1. كل مرض بيتحفظ كـ HealthCase تاريخية (is_historical: true)
const healthCase = await HealthCase.create({
  is_historical: true,
  resolved:      !stillAffected,   // لو still_affected=true → الحالة مفتوحة
  resolved_at:   stillAffected ? null : new Date(),
});

// 2. لو الحيوان لسه مريض (still_affected=true) → تحديث حالته الصحية
if (anyStillAffected && animal.health_status === "healthy") {
  await Animal.findByIdAndUpdate(animal._id, { health_status: "sick" });
}

// 3. اللقاحات بتتحفظ مع التمييز: اتاخد (administered:true) أو مجدول (administered:false)
```

---

---

## 🏡 Feature 3: إدارة المزرعة والداشبورد (Farm Management & Dashboard)

---

### 🎤 [المقدمة — المشكلة]

> **"المزارع محتاج يشوف حالة مزرعته كلها في لحظة — كام حيوان بالظبط؟ مين عيان؟ إيه التطعيمات الجاية؟"**

---

### 📋 [الشرح التقني]

#### إنشاء المزرعة بمنطق ذكي لمنع التكرار:

النظام مش بيعتمد على مقارنة نصية حرفية — ده ممكن يخلي "مزرعة النيل" و"مزرعه النيل" يتسجلوا كمزرعتين. الكود بيستخدم دالة `areFarmNamesSimilar`:

```javascript
// في Farm.controller.js
const findDuplicateFarm = async (userId, name, governorate, excludeId = null) => {
  const farms = await Farm.find({ user_id: userId, governorate });
  return farms.find((farm) => areFarmNamesSimilar(name, farm.name)) || null;
};
```

> بتتعامل مع التشكيل وتاء مربوطة وصيغ الألف المختلفة عشان منسجلش نفس المزرعة مرتين بسبب خطأ إملائي بسيط.

---

#### الداشبورد — إحصائيات لحظية متكاملة:

الداشبورد مش بس أرقام — عنده **3 مكونات ذكية:**

**① مؤشر الصحة الأسبوعي (Weekly Health Score):**

```javascript
// في Farm.controller.js — buildWeeklyHealthTrends
for (let i = 6; i >= 0; i--) {
  const dayCases = healthCases.filter(c => /* حالات اليوم ده */);
  const redCount = dayCases.filter(c => c.severity === "red").length;

  // كل حالة بتنزل 12 نقطة، كل حالة حرجة بتنزل 20 نقطة إضافية
  const score = Math.max(0, Math.min(100, 100 - dayCases.length * 12 - redCount * 20));

  trends.push({ day: "الأحد", score: 85, label: "2 حالة" });
}
```

**② التوصيات الذكية (AI Recommendations):**

```javascript
// buildAIRecommendations — بتتولد تلقائياً بناءً على حالة المزرعة
if (criticalCount > 0)
  → "⚠️ X حيوانات بحالة حرجة — تدخل بيطري فوري"

if (upcomingVaccinations > 0)
  → "💉 لديك X تطعيمات خلال الـ 30 يوم القادمة"

if (openEmergencies > 0)
  → "🚨 X حالات طوارئ مفتوحة تحتاج متابعة"

if (everything_ok)
  → "✅ الوضع الصحي مستقر — استمر في المتابعة الدورية"
```

**③ سجل النشاطات الأخيرة (Recent Activities):**

```javascript
// buildRecentActivities — بيجمع ويرتب زمنياً
[
  { type: "alert",      text: "تشخيص جديد: حمى القلاعية",    actor: "الذكاء الاصطناعي" },
  { type: "vaccination",text: "تطعيم لقاح التحصين — #442",   actor: "المزارع" },
  { type: "success",    text: "تمت إضافة حيوان #105 (بقرة)", actor: "المزارع" },
]
// بيرتب من الأحدث للأقدم ويأخد آخر 8 نشاطات بس
```

---

#### إدارة الحيوانات — CRUD مع حماية الصلاحيات:

```javascript
// في Animal.controller.js
// 1. الإنشاء بيزود counter المزرعة تلقائياً
await Farm.findByIdAndUpdate(farm_id, { $inc: { total_animals: 1 } });

// 2. منع تكرار رقم الوسم (Tag Number) داخل نفس المزرعة
if (err.code === 11000) {
  return res.status(409).json({ message: "رقم الوسم موجود بالفعل في هذه المزرعة" });
}

// 3. حذف ناعم (Soft Delete) — الحيوان ميتمسحش من قاعدة البيانات
// بس بيتحدد is_active: false فبيفضل في السجل للتقارير التاريخية
```

**البحث في الحيوانات:**
```javascript
// بحث regex عبر مزارع المستخدم كلها
const animals = await Animal.find({
  farm_id:    { $in: farmIds },
  is_active:  true,
  tag_number: { $regex: q.trim(), $options: "i" }
}).limit(10);
```

---

#### نظام اكتشاف الفاشيات (Outbreak Detection) — يشتغل أوتوماتيكي:

الـ Cron Job بيشغّل كل فترة ويعمل التحقق التالي:

```javascript
// في outbreakDetection.js
const OUTBREAK_CASE_THRESHOLD = 6;   // 6 حيوانات مختلفة بنفس المرض
const OUTBREAK_WINDOW_HOURS   = 48;  // خلال 48 ساعة
const OUTBREAK_REJECTION_COOLDOWN_HOURS = 24; // لو الأدمن رفض → استنى 24 ساعة

// الـ Aggregation بيعدّ حيوانات فريدة (مش تكرارات لنفس الحيوان)
HealthCase.aggregate([
  { $group: { _id: { animal_id, diagnosis, governorate } } },
  { $group: { _id: { governorate, diagnosis }, unique_animals_count: { $sum: 1 } } },
  { $match: { unique_animals_count: { $gte: 6 } } },  // ← لو تخطى الحد
]);
```

**لو اكتشف فاشية:**
1. بيولّد رسالة تحذير بـ Gemini AI
2. بيسجلها في `OutbreakReport` بحالة `"pending"` (تنتظر موافقة الأدمن)
3. بعد موافقة الأدمن → تبقى `"active"` وتظهر لكل المستخدمين في محافظتها
4. بيبعت إشعار لأصحاب المزارع المتأثرين

---

### 🎯 [الخلاصة — الـ Tech Stack للـ 3 Features]

| الـ Feature | التقنيات الأساسية |
|-------------|------------------|
| **التشخيص** | `Gemini Vision`, `Groq Whisper`, `MediaRecorder API`, `multer`, `LangChain RAG` |
| **الـ Onboarding** | `Gemini` + System Prompt متطور, `RAG` متجدد, `mongoose` للحفظ الذكي |
| **إدارة المزرعة** | `MongoDB Aggregation`, `node-cron`, `firebase-admin` للإشعارات, `recharts` للرسوم البيانية |

---

### 💬 [جمل ختامية مقترحة]

> **"المشروع ده مش مجرد تطبيق — ده نظام ذكي بيفهم المزارع المصري، بيتكلم معاه بلغته، وبيحافظ على حيواناته."**

> **"من الصوت للتشخيص، ومن التشخيص للإشعار الفوري — كل خطوة متصلة بالتانية."**

> **"استخدمنا الـ AI مش كأداة لعرض، لكن كأساس في كل فيتشر من الثلاثة."**
