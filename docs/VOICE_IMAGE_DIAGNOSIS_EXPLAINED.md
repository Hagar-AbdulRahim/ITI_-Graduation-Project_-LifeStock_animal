# شرح آلية التشخيص بالصوت والصورة — Frontend & Backend

## نظرة عامة

النظام يدعم 4 أنواع تشخيص:
| النوع | endpoint |
|-------|----------|
| نص | `POST /api/health-cases/diagnose` |
| صوت | `POST /api/health-cases/diagnose/voice` |
| صورة | `POST /api/health-cases/diagnose/image` |
| صوت + صورة معاً | `POST /api/health-cases/diagnose/image` (نفس الـ endpoint) |

---

## 🎤 أولاً: التشخيص بالصوت (Voice Diagnosis)

### الـ Frontend — كيف بيسجل الصوت؟

**الملف:** [`AiAssistantPage.jsx`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/frontend/src/pages/AiAssistantPage.jsx)

المستخدم يضغط على زر الميكروفون، فيحصل الآتي:

```javascript
// 1. بيطلب إذن المتصفح للوصول للميكروفون
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// 2. بيعمل MediaRecorder يسجل الصوت
const mediaRecorder = new MediaRecorder(stream);

// 3. بيجمع قطع الصوت في مصفوفة
mediaRecorder.ondataavailable = (e) => {
  if (e.data.size > 0) audioChunksRef.current.push(e.data);
};

// 4. لما بيوقف التسجيل، بيحول القطع لـ Blob بصيغة webm
mediaRecorder.onstop = () => {
  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
  setAttachedAudio(audioBlob); // بيحفظه في state
};
```

> **الأداة المستخدمة:** `MediaRecorder API` — مبنية في المتصفح نفسه، مش بيحتاج مكتبة خارجية.

---

### الـ Frontend — كيف بيبعته للسيرفر؟

**الملف:** [`ChatAi.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/frontend/src/services/AiServices/ChatAi.js)

```javascript
export const diagnoseWithVoice = (audioBlob, animalId, species) => {
  const formData = new FormData()
  // بيحط الـ Blob في FormData باسم 'audio' وبامتداد .webm
  formData.append('audio', audioBlob, 'recording.webm')
  if (animalId) formData.append('animal_id', animalId)
  if (species)  formData.append('species', species)

  return api.post(`/api/health-cases/diagnose/voice`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000, // 90 ثانية (الصوت ممكن يأخذ وقت في التحويل)
  })
}
```

---

### الـ Backend — Middleware (استقبال الملف الصوتي)

**الملف:** [`Uploadaudio.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/middelwares/Uploadaudio.js)

```javascript
// Multer بيستقبل الملف الصوتي ويحفظه مؤقتاً في uploads/audio/
const allowedMimeTypes = [
  "audio/webm", "audio/mp3", "audio/mpeg", "audio/wav",
  "audio/m4a", "audio/ogg", "audio/x-m4a", "application/octet-stream", "audio/aac"
];

// سواء عن طريق MIME type أو عن طريق امتداد الملف
const isMimeOk = allowedMimeTypes.includes(file.mimetype);
const isExtOk  = /webm|mp3|wav|m4a|ogg|mpeg|aac/i.test(extension);
```

- حد أقصى للحجم: **20MB**
- اسم الملف: يتولد بـ `timestamp + random` عشان يكون unique

---

### الـ Backend — تحويل الصوت لنص (Transcription)

**الملف:** [`voiceService.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/voiceService.js)

```javascript
const transcribeAudio = async (filePath) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const transcription = await groq.audio.transcriptions.create({
    file:     fs.createReadStream(filePath), // بيقرأ الملف من القرص
    model:    "whisper-large-v3",            // موديل Whisper الأقوى
    language: "ar",                          // عربي
    prompt:   "مزرعة، ماشية، أبقار، أغنام، ماعز، مرض، أعراض، علاج",
    // الـ prompt بيوجه الموديل لمصطلحات بيطرية عشان يتعرف عليها بدقة أكبر
  });

  return transcription.text; // بيرجع النص العربي
};
```

> **التقنية:** `Groq SDK` + نموذج `Whisper Large V3`

---

### الـ Backend — Controller (معالجة الصوت)

**الملف:** [`Healthcase.controller.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/controllers/Healthcase.controller.js)

```javascript
const diagnoseVoice = async (req, res) => {
  let audioPath = null;
  try {
    audioPath = req.file.path; // مسار الملف الصوتي المؤقت

    // 1. تحويل الصوت لنص
    const transcribedText = await transcribeAudio(audioPath);

    // 2. إرسال النص المُحوَّل للـ AI بنفس منطق التشخيص النصي
    const result = await runDiagnosis(req, {
      symptoms:   [transcribedText],
      input_type: "voice",
    });

    // 3. إرجاع النص المفرَّغ مع نتيجة التشخيص
    result.body.transcribed_text = transcribedText;
    return res.status(result.status).json(result.body);

  } finally {
    // ✅ الأهم: بيحذف الملف الصوتي المؤقت بعد المعالجة (توفير مساحة)
    if (audioPath) fs.unlink(audioPath, (err) => { ... });
  }
};
```

---

## 🖼️ ثانياً: التشخيص بالصورة (Image Diagnosis)

### الـ Frontend — كيف بيختار الصورة؟

**الملف:** [`AiAssistantPage.jsx`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/frontend/src/pages/AiAssistantPage.jsx)

- المستخدم يضغط على أيقونة المرفقات (Paperclip).
- يختار صورة أو أكثر من الجهاز.
- الصور بتتحفظ في `state` كـ `File[]`.
- بيعرض Preview للصور باستخدام `URL.createObjectURL(file)`.

---

### الـ Frontend — إصلاح الـ MIME Type قبل الإرسال (مهم!)

**الملف:** [`ChatAi.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/frontend/src/services/AiServices/ChatAi.js)

```javascript
export const diagnoseWithImage = (imageFile, animalId, species, symptoms) => {
  const formData = new FormData()

  // بعض الصور (زي .jfif) بيكون MIME type غلط عند الرفع
  // فبيصلح الـ MIME type قبل إرسالها
  const mimeMap = {
    jfif: 'image/jpeg', jpe: 'image/jpeg', jpg: 'image/jpeg',
    jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'
  }

  files.forEach((file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const correctMime = mimeMap[ext] || file.type || 'image/jpeg'

    // لو الـ type مش صح، بيعمل File جديد بالـ MIME الصحيح
    const fixedFile = file.type === correctMime
      ? file
      : new File([file], file.name.replace(`.${ext}`, '.jpg'), { type: correctMime })

    formData.append('images', fixedFile) // اسم الـ field هو 'images' (جمع)
  })

  return api.post(`/api/health-cases/diagnose/image`, formData, {
    timeout: 60000, // 60 ثانية (الصورة ممكن تأخذ وقت في التحليل)
  })
}
```

---

### الـ Backend — Middleware (استقبال الصور)

**الملف:** [`Uploadimage.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/middelwares/Uploadimage.js)

```javascript
// بيفحص الملف بطريقتين: MIME type + امتداد الملف
const isImageMime = file.mimetype && file.mimetype.startsWith("image/");
const isImageExt  = /jpeg|jpg|png|webp|gif|jfif|bmp/i.test(extension);

// أي طريقة تنجح = الملف مقبول
if (isImageMime || isImageExt) return cb(null, true);
```

- حد أقصى للحجم: **15MB**
- تُحفظ في: `./uploads/health-cases/hc-{timestamp}-{random}.ext`

---

### الـ Backend — كيف بيحلل الصورة بالـ AI؟

**الملف:** [`aiagent.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/services/aiagent.js)

```javascript
// تحويل الصورة لـ Base64 لإرسالها لـ Gemini
const imageToGeminiPart = (imagePath, mimeType) => ({
  inlineData: {
    data:     fs.readFileSync(imagePath).toString("base64"), // قراءة الملف وتحويله
    mimeType: mimeType || "image/jpeg",
  },
});

// في دالة diagnoseSymptoms:
const currentParts = [];
if (imagePath && fs.existsSync(imagePath)) {
  currentParts.push(imageToGeminiPart(imagePath, imageMime)); // ← الصورة أولاً
}
currentParts.push({ text: userPrompt }); // ← ثم النص (الأعراض)

// بيبعتهم سوا لـ Gemini Vision في نفس الرسالة
const result = await chat.sendMessage(currentParts);
```

> **التقنية:** `Google Gemini Vision` عبر `@google/generative-ai` — بيستقبل صورة + نص ويحللهم سوا.

---

## 🎤🖼️ ثالثاً: الصوت والصورة معاً (Mixed Mode)

### الـ Frontend

**الملف:** [`ChatAi.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/frontend/src/services/AiServices/ChatAi.js)

```javascript
export const diagnoseWithMixed = (audioBlob, imageFiles, animalId, species, symptoms) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm') // ← صوت
  files.forEach(file => formData.append('images', fixedFile))  // ← صور
  if (symptoms) formData.append('symptoms', symptoms)          // ← نص اختياري

  // يروح لنفس endpoint الصورة!
  return api.post(`/api/health-cases/diagnose/image`, formData, { timeout: 90000 })
}
```

### الـ Backend — Controller (معالجة الصوت والصورة معاً)

**الملف:** [`Healthcase.controller.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/controllers/Healthcase.controller.js)

```javascript
const diagnoseImage = async (req, res) => {
  // بيجمع كل أنواع الملفات من الـ request
  const files      = req.files?.images || req.files?.image || [];
  const audioFiles = req.files?.audio  || [];

  // 1. لو في صوت → يحوله لنص أولاً
  let transcribedText = null;
  if (hasAudio) {
    transcribedText = await transcribeAudio(audioFiles[0].path);
  }

  // 2. يحدد نوع الإدخال تلقائياً
  const inputType = hasAudio && hasImage ? "voice+image"
                  : hasAudio             ? "voice"
                  : hasImage             ? "image"
                  : "text";

  // 3. يجمع الأعراض: نص مكتوب + نص مفرَّغ من الصوت
  const symptomsPayload = [];
  if (hasText)          symptomsPayload.push(req.body.symptoms);
  if (transcribedText)  symptomsPayload.push(transcribedText);

  // 4. يبعتهم للـ AI مع الصورة
  const result = await runDiagnosis(req, {
    symptoms:   symptomsPayload,
    input_type: inputType,
    imagePath:  files[0]?.path,       // ← مسار الصورة
    imageMime:  normalizeImageMime(files[0]), // ← MIME type الصحيح
  });
};
```

---

## Middleware الخاص بالـ Mixed (صوت + صورة)

**الملف:** [`Uploadmixed.js`](file:///e:/slides/iti%20project/ITI_-Graduation-Project_-LifeStock_animal/backend/middelwares/Uploadmixed.js)

```javascript
// بيوجّه كل نوع فايل لمجلده الصحيح تلقائياً
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.fieldname === "audio";
    cb(null, isAudio ? "./uploads/audio" : "./uploads/health-cases");
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === "audio" ? "audio" : "hc";
    cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
// حد أقصى: 25MB (لأنه بيستقبل صوت + صور في نفس الوقت)
```

---

## ملخص تدفق البيانات الكامل

```
المستخدم (المتصفح)
      │
      ├─ نص مكتوب ───────────────────────────────────────────────────────────►  /diagnose (JSON)
      │                                                                              │
      ├─ ميكروفون → MediaRecorder API → Blob(webm) → FormData('audio')    ────────► /diagnose/voice
      │                                                                              │
      ├─ صورة → File + إصلاح MIME → FormData('images') ─────────────────────────► /diagnose/image
      │                                                                              │
      └─ صوت + صورة معاً → FormData('audio' + 'images') ────────────────────────► /diagnose/image
                                                                                    │
                                                                         Backend (Node.js)
                                                                                    │
                                                                    ┌───────────────┤
                                                                    │               │
                                                              Multer middleware      │
                                                          (حفظ الملفات مؤقتاً)      │
                                                                    │               │
                                                                    ▼               │
                                                          ┌─────────────────┐       │
                                                          │   صوت؟          │       │
                                                          │ → Groq Whisper  │       │
                                                          │ → نص عربي       │       │
                                                          └────────┬────────┘       │
                                                                   │                │
                                                                   ▼                ▼
                                                          ┌─────────────────────────────────────┐
                                                          │ RAG: البحث في قاعدة المعرفة البيطرية│
                                                          │ Gemini Vision: تحليل الصورة + النص  │
                                                          │ نتيجة JSON: تشخيص + خطورة + علاج    │
                                                          └─────────────────────────────────────┘
                                                                          │
                                                              حفظ في MongoDB
                                                              حذف الملفات المؤقتة
                                                                          │
                                                                     Response للـ Frontend
```

---

## ملخص التقنيات المستخدمة

| المهمة | التقنية / الحزمة |
|--------|-----------------|
| تسجيل الصوت في المتصفح | `MediaRecorder API` (مدمج في المتصفح) |
| إرسال الملفات | `FormData` + `axios` |
| إصلاح MIME Type | منطق مخصص في `ChatAi.js` |
| استقبال الملفات (Backend) | `multer` |
| تحويل الصوت لنص | `Groq SDK` + نموذج `Whisper Large v3` |
| تحليل الصورة | `Google Gemini Vision` عبر `@google/generative-ai` |
| التشخيص النصي | `Gemini` + `RAG System` (`@langchain/mongodb`) |
| حذف الملفات المؤقتة | `fs.unlink` في Node.js |
