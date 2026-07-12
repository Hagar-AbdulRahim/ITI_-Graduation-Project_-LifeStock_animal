const express = require("express");
const router  = express.Router();
const { query, validationResult } = require("express-validator");
const { findNearbyClinics, geocodeGovernorate } = require("../services/clinicsService");
const { getCoordinatesByGovernorate }           = require("../utils/governorateCoordinates");
const { chatModel } = require("../config/gemini");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "بيانات غير صحيحة",
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * GET /api/clinics/nearby  — بدون تغيير
 */
router.get(
  "/nearby",
  [
    query("lat").optional().isFloat({ min: -90,  max: 90  }).withMessage("lat غير صحيحة"),
    query("lng").optional().isFloat({ min: -180, max: 180 }).withMessage("lng غير صحيحة"),
    query("radius").optional().isInt({ min: 500, max: 100000 }).withMessage("radius لازم بين 500 و 100000 متر"),
  ],
  validate,
  async (req, res) => {
    try {
      let { lat, lng, radius } = req.query;
      let location_source = "gps";
      const governorate = req.query.governorate;

      if (!lat || !lng) {
        let coords = getCoordinatesByGovernorate(governorate);
        if (!coords) coords = await geocodeGovernorate(governorate);

        if (!coords) {
          return res.status(400).json({
            success: false,
            message: "تعذّر تحديد موقعك. فعّل الـ GPS أو اختر محافظتك.",
          });
        }

        lat             = coords.lat;
        lng             = coords.lng;
        location_source = "governorate";
      } else {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
      }

      const clinics = await findNearbyClinics({
        lat,
        lng,
        radius: radius ? parseInt(radius, 10) : undefined,
        governorate,
      });

      res.json({
        success:         true,
        location_source,
        search_location: { lat, lng },
        count:           clinics.length,
        data:            clinics,
      });
    } catch (err) {
      console.error("clinics/nearby error:", err.message);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء البحث عن العيادات القريبة",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────
// Helpers لفهم نية اليوزر من رسالته (+ تاريخ المحادثة لو محتاجين سياق)
// ─────────────────────────────────────────────────────────────────────────

/** بيدور جوه رسالة اليوزر على رقم مسافة مطلوب زي "5 كم" أو "10 كيلومتر" */
const extractRequestedDistanceKm = (message) => {
  if (!message) return null;
  const match = message.match(/(\d+(?:\.\d+)?)\s*(?:كم|كيلومتر|km)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
};

/**
 * التصنيف بيعتمد على اسم الجهة نفسه (مش على c.source اللي بيبقى نفس القيمة
 * "local_directorate" لكل حاجة جاية من ملف الـ fallback المحلي، سواء كانت
 * مديرية حكومية أو عيادة خاصة).
 */
const isGovernmentDirectorate = (c) => /مديري[ةه]/.test(c?.name || "");
const facilityTypeLabel = (c) =>
  isGovernmentDirectorate(c) ? "مديرية طب بيطري حكومية" : "عيادة بيطرية خاصة";

/** آخر رسالة يوزر في الـ history — مستخدمة كـ fallback لفهم أسئلة المتابعة */
const lastUserMessage = (history = []) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if ((h?.sender || h?.role) === "user") return h.text || h.content || "";
  }
  return "";
};

/** آخر رسالة AI في المحادثة (مش أي رسالة قديمة) — دي المرجع الوحيد لفهم "قصدك مين؟" */
const lastAiMessage = (history = []) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if ((h?.sender || h?.role) === "ai") return h;
  }
  return null;
};

/** بيدور على نية "نوع الجهة" (مديرية / عيادة خاصة) في الرسالة الحالية، وبعدين في آخر رسالة يوزر */
const detectRequestedFacilityType = (message, history = []) => {
  const check = (text) => {
    if (!text) return null;
    if (/مديري[ةه]/.test(text)) return "directorate";
    if (/عياد[ةه]?\s*خاص|خاص[ةه]/.test(text)) return "private";
    return null;
  };
  return check(message) || check(lastUserMessage(history));
};

/** نفس الفكرة لنوع التفصيلة المطلوبة (مواعيد / تليفون / عنوان) */
const detectDetailIntent = (message, history = []) => {
  const check = (text) => {
    if (!text) return null;
    if (/مواعيد|ساعات العمل|وقت العمل|فاتح|مفتوح|اجاز|عطل/.test(text)) return "hours";
    if (/تليفون|رقم|اتصال|هاتف/.test(text)) return "phone";
    if (/عنوان|فين|مكان/.test(text)) return "address";
    return null;
  };
  return check(message) || check(lastUserMessage(history));
};

const DETAIL_FIELD_MAP = {
  hours:   { label: "مواعيد العمل", get: (c) => c.opening_hours },
  phone:   { label: "التليفون",      get: (c) => c.phone },
  address: { label: "العنوان",        get: (c) => c.address },
};

// ─────────────────────────────────────────────────────────────────────────
// ترجمة العناوين/المواعيد للعربي — عشان الكروت في الواجهة تتوافق مع الرد
// النصي (اللي كان بيترجم لوحده من غير ما الكروت تتغيّر). بنترجم بس لو
// فيه حروف إنجليزي فعلاً (لو أصلاً عربي، منستدعيش Gemini خالص)، وبنكاش
// كل نص اتترجم قبل كده عشان منترجمش نفس العنوان أكتر من مرة عبر الطلبات.
// ─────────────────────────────────────────────────────────────────────────
const containsLatinLetters = (s) => /[A-Za-z]/.test(s || "");
const translationCache = new Map(); // original string → ترجمة عربي

/** بيستخرج أول JSON array موجود في النص، حتى لو الموديل زوّد كلام أو fences حواليه */
function extractJsonArray(raw) {
  const cleaned = raw.trim().replace(/^```json\s*|^```\s*|```\s*$/g, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* هنرجع تحت */ }
    }
  }
  return null;
}

async function translateStringsOnce(list) {
  const numbered = list.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const prompt = `ترجم كل سطر من العناوين أو أوقات العمل دي للعربي:
- اسم الشارع/المنطقة: ترجمة طبيعية للعربي (مش نقل حرفي بالحروف).
- اختصارات الأيام بالإنجليزي (Fri, Sat, Mon...) حوّلها لاسم اليوم بالعربي.
- الأرقام وتنسيق الوقت (زي 00:00-24:00) سيبها زي ما هي بدون تغيير.
أرجع فقط JSON array من النصوص المترجمة بنفس الترتيب، بدون أي شرح أو نص إضافي:

${numbered}`;

  const result = await chatModel.generateContent([{ text: prompt }]);
  const raw = result.response.text();
  const arr = extractJsonArray(raw);
  if (!Array.isArray(arr) || arr.length !== list.length) {
    throw new Error(`رد الترجمة مش JSON array سليم (طول متوقع ${list.length}): ${raw.slice(0, 200)}`);
  }
  return arr;
}

async function translateStrings(strings) {
  if (strings.length === 0) return {};

  // بنحاول مرتين قبل ما نستسلم، لأن أخطاء الشبكة/الفورمات بتحصل أحيانًا لمرة واحدة بس
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const arr = await translateStringsOnce(strings);
      const map = {};
      strings.forEach((s, i) => { if (typeof arr[i] === "string" && arr[i].trim()) map[s] = arr[i].trim(); });
      return map;
    } catch (err) {
      console.error(`translateStrings error (محاولة ${attempt}):`, err.message);
      if (attempt === 2) return {}; // فشلنا مرتين → نسيب النصوص الأصلية زي ما هي، منكسرش الفيتشر
    }
  }
  return {};
}

/** بيرجع نفس مصفوفة العيادات بس بعنوان ومواعيد مترجمة للعربي */
async function arabizeClinics(clinics) {
  const needed = new Set();
  for (const c of clinics) {
    if (c.address && containsLatinLetters(c.address) && !translationCache.has(c.address)) needed.add(c.address);
    if (c.opening_hours && containsLatinLetters(c.opening_hours) && !translationCache.has(c.opening_hours)) needed.add(c.opening_hours);
  }
  if (needed.size > 0) {
    const list = [...needed];
    const translated = await translateStrings(list);
    for (const s of list) translationCache.set(s, translated[s] || s);
  }
  return clinics.map((c) => ({
    ...c,
    address:       c.address ? (translationCache.get(c.address) || c.address) : c.address,
    opening_hours: c.opening_hours ? (translationCache.get(c.opening_hours) || c.opening_hours) : c.opening_hours,
  }));
}

/** تطبيع بسيط لتسهيل مطابقة أسماء العيادات (فراغات زيادة، تشكيل، حالة الحروف، اختلاف صيغ الألف/الياء) */
const normalizeArabicText = (s = "") =>
  s
    .replace(/[\u064B-\u0652]/g, "")   // تشكيل
    .replace(/[إأآا]/g, "ا")            // توحيد صيغ الألف
    .replace(/ى/g, "ي")                 // ألف مقصورة → ياء
    .replace(/ة/g, "ه")                 // تاء مربوطة → هاء
    .replace(/[^\p{L}\p{N}\s]/gu, " ")  // إزالة علامات الترقيم
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// كلمات شائعة بنتجاهلها عند المطابقة عشان متأثرش على النتيجة (مش مميزة)
const STOPWORDS = new Set([
  "د", "دكتور", "لدكتور", "عياده", "عيادة", "عيادات", "مركز", "في", "من",
  "على", "عن", "ال", "و", "او", "أو", "لل", "بيطري", "بيطرية", "بيطريه",
]);

const meaningfulTokens = (text) =>
  normalizeArabicText(text)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

/**
 * بيحدد العيادة اللي اليوزر بيقصدها، بمطابقة "توكنز" مش نص حرفي كامل —
 * فلو قال "عيادة pets لدكتور هاني فريد" بيتطابق مع "Pets Clinic ... هانى فريد"
 * حتى لو الصياغة مختلفة، لأننا بنقارن الكلمات المميزة (أسماء/كلمات أجنبية)
 * مش الجملة كلها.
 * 1) لو فيه تطابق كافي في الكلمات المميزة، بناخد أعلى نتيجة (وأقرب مسافة عند التعادل).
 * 2) لو مفيش ذكر صريح، بنبص بس على آخر رسالة AI في المحادثة (مش أي رسالة قديمة):
 *    لو كانت مركّزة على عيادة واحدة بس (سؤال متابعة زي "مواعيدها إيه؟")، بناخدها هي.
 *    غير كده بنرجّع null، والراوت هو اللي يقرر يسأل اليوزر يقصد مين.
 */
const resolveTargetClinic = (message, clinics, history = []) => {
  const msgTokens = meaningfulTokens(message);

  if (msgTokens.length > 0) {
    let best = null, bestScore = 0;
    for (const c of clinics) {
      const nameTokens = meaningfulTokens(c.name);
      let score = 0;
      for (const mt of msgTokens) {
        if (nameTokens.some((nt) => nt.includes(mt) || mt.includes(nt))) score++;
      }
      if (score > bestScore || (score === bestScore && score > 0 && best && (c.distance_km ?? Infinity) < (best.distance_km ?? Infinity))) {
        best = c; bestScore = score;
      }
    }
    if (bestScore > 0) return best;
  }

  // ⚠️ بس آخر رسالة AI في المحادثة، مش أي رسالة قديمة — عشان منجيبش سياق باين
  const lastAi = lastAiMessage(history);
  if (lastAi && Array.isArray(lastAi.clinics) && lastAi.clinics.length === 1) {
    return lastAi.clinics[0];
  }
  return null;
};

/**
 * POST /api/clinics/emergency
 * بيوجّه الرد حسب نية اليوزر — قاعدة أساسية: النص والكاردات مايرجعوش مع بعض أبداً:
 *   - سؤال تفصيلة (مواعيد/تليفون/عنوان) لعيادة محددة بوضوح → رد نصي بس (clinics: [])
 *   - سؤال تفصيلة + مفيش عيادة واحدة واضحة ومفيش لبس (نتيجة واحدة بس متاحة) → رد نصي بس
 *   - سؤال تفصيلة + فيه أكتر من عيادة ومفيش تحديد واضح → نسأل اليوزر يحدد مين (بدل ما نخمّن)
 *   - بدون سؤال تفصيلة (زي "أقرب عيادة" أو ذِكر عيادة من غير سؤال تفصيلة) → كاردات بس (reply: "")
 *   - نوع منشأة محدد (مديرية / عيادة خاصة)                 → فلترة القائمة قبل أي حاجة تانية
 *   - مسافة محددة ("5 كم")                                → فلترة فعلية بالمسافة
 */
router.post("/emergency", async (req, res) => {
  try {
    const { message, lat, lng, governorate, history = [] } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "أرسل lat و lng" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "أرسل رسالة" });
    }

    // 1. فهم النية من الرسالة (+ سياق آخر رسالة لو محتاجين)
    const requestedDistanceKm = extractRequestedDistanceKm(message);
    const requestedFacilityType = detectRequestedFacilityType(message, history);
    const detailIntent = detectDetailIntent(message, history);

    // 2. جلب العيادات بالمسافة المطلوبة (أو نطاق افتراضي)
    const SEARCH_RADIUS = requestedDistanceKm ? Math.min(requestedDistanceKm * 1000, 100000) : 50000;
    let clinics = await findNearbyClinics({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: SEARCH_RADIUS,
      governorate,
    });

    if (requestedDistanceKm) {
      clinics = clinics.filter((c) => c.distance_km != null && c.distance_km <= requestedDistanceKm);
    }

    // 3. فلترة نوع المنشأة لو اليوزر حدده صراحة
    if (requestedFacilityType === "directorate") {
      clinics = clinics.filter(isGovernmentDirectorate);
    } else if (requestedFacilityType === "private") {
      clinics = clinics.filter((c) => !isGovernmentDirectorate(c));
    }

    // 3.5 نترجم العناوين والمواعيد للعربي قبل أي استخدام تاني — عشان الكروت
    // اللي هترجع للفرونت إند تتوافق مع أي رد نصي (مش بس النص يترجم لوحده)
    clinics = await arabizeClinics(clinics);

    // 4. مفيش نتائج بعد الفلترة → رد مباشر بدون استدعاء Gemini
    if (clinics.length === 0) {
      const distNote = requestedDistanceKm ? ` في نطاق ${requestedDistanceKm} كم` : "";
      const typeNote = requestedFacilityType === "directorate" ? "مديرية طب بيطري حكومية"
                      : requestedFacilityType === "private" ? "عيادة بيطرية خاصة" : "عيادات";
      return res.json({
        success: true,
        reply: `للأسف مفيش ${typeNote}${distNote} قريبة من موقعك حاليًا. جرّبي تكبّري نطاق البحث أو تتأكدي من تحديد المحافظة صح.`,
        clinics: [],
      });
    }

    // 5. تحديد العيادة اللي اليوزر بيقصدها (لو موجودة وواضحة)
    const targetClinic = resolveTargetClinic(message, clinics, history);

    // ── الحالة أ: عيادة محددة بوضوح + سؤال تفصيلة → رد نصي بس، من غير كارد ─
    if (targetClinic && detailIntent) {
      const field = DETAIL_FIELD_MAP[detailIntent];
      const value = field.get(targetClinic);
      const reply = value
        ? `${field.label} بتاعة ${targetClinic.name}: ${value}`
        : `للأسف ${field.label} بتاعة ${targetClinic.name} مش متاحة عندنا دلوقتي — ممكن تتأكدي بالاتصال المباشر.`;
      return res.json({ success: true, reply, clinics: [] });
    }

    // ── الحالة ب: سؤال تفصيلة بدون عيادة محددة ──────────────────────────
    if (!targetClinic && detailIntent) {
      const field = DETAIL_FIELD_MAP[detailIntent];

      // ب.1: نتيجة واحدة بس أصلاً متاحة → مفيش لبس، نرد عليها مباشرة
      if (clinics.length === 1) {
        const only = clinics[0];
        const value = field.get(only);
        const reply = value
          ? `${field.label} بتاعة ${only.name}: ${value}`
          : `للأسف ${field.label} بتاعة ${only.name} مش متاحة عندنا دلوقتي.`;
        return res.json({ success: true, reply, clinics: [] });
      }

      // ب.2: فيه أكتر من عيادة ومفيش تحديد واضح → نسأل اليوزر يحدد مين بدل ما نخمّن
      const top = clinics.slice(0, 5);
      const options = top.map((c, i) => `${i + 1}. ${c.name}`).join("\n");
      return res.json({
        success: true,
        reply: `تقصدي أي عيادة بالظبط؟ من فضلك اكتبي الاسم أو رقمها:\n${options}`,
        clinics: [],
      });
    }

    // ── الحالة ج/د: مفيش سؤال تفصيلة → كاردات بس، من غير رد نصي ───────────
    // (سواء عيادة محددة أو قائمة عامة زي "أقرب عيادة بيطرية")
    const clinicsToReturn = targetClinic ? [targetClinic] : clinics;
    return res.json({ success: true, reply: "", clinics: clinicsToReturn });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: "حدث خطأ." });
  }
});

module.exports = router;