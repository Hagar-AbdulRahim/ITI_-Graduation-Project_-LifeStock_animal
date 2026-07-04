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
 * GET /api/clinics/nearby
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

      if (!lat || !lng) {
        const governorate = req.query.governorate;

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

/**
 * POST /api/clinics/emergency
 */
router.post("/emergency", async (req, res) => {
  try {
    const { message, lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "أرسل lat و lng من الـ GPS",
      });
    }

    // 50 كم — يغطي محافظة كاملة تقريباً
    const SEARCH_RADIUS = 50000;
    const clinics = await findNearbyClinics({
      lat:    parseFloat(lat),
      lng:    parseFloat(lng),
      radius: SEARCH_RADIUS,
    });

    const radiusKm = SEARCH_RADIUS / 1000;

    const clinicsText = clinics.length === 0
      ? `لا توجد عيادات بيطرية مسجلة في نطاق ${radiusKm} كم من موقعك.`
      : clinics.map((c, i) =>
          `${i + 1}. ${c.name}
   المسافة: ${c.distance_km} كم
   العنوان: ${c.address || "غير متاح"}
   التليفون: ${c.phone || "غير متاح"}
   مواعيد العمل: ${c.opening_hours || "غير متاح"}`
        ).join("\n\n");

    const prompt = `
أنت مساعد بيطري طارئ. المزارع يحتاج مساعدة عاجلة.

العيادات البيطرية القريبة من موقعه (${clinics.length} عيادة في نطاق ${radiusKm} كم):
${clinicsText}

سؤال المزارع: ${message || "محتاج أقرب عيادة بيطرية"}

تعليمات الرد:
- أجب بالعربية البسيطة والواضحة
- اذكر كل العيادات المتاحة مع بياناتها كاملة
- لو سأل عن مواعيد أو تليفون عيادة معينة أجبه من البيانات بالظبط
- لو بيانات ناقصة قول "غير متاح" بوضوح
- لا تخترع أي معلومات غير موجودة في البيانات
- لو مفيش عيادات انصحه يتواصل مع المديرية الزراعية أو طبيب بيطري يعرفه
`.trim();

    let reply;
    try {
      const result = await chatModel.generateContent([{ text: prompt }]);
      reply = result.response.text().trim();
    } catch (geminiErr) {
      console.error("Gemini error in /emergency:", geminiErr.message);
      // رد احتياطي لو Gemini فشل
      if (clinics.length === 0) {
        reply = `لم نجد عيادات بيطرية مسجلة في نطاق ${radiusKm} كم من موقعك. يُنصح بالتواصل مع أقرب مديرية زراعية أو طبيب بيطري تعرفه.`;
      } else {
        const c = clinics[0];
        reply = `أقرب عيادة ليك هي "${c.name}" على بُعد ${c.distance_km} كم.`
          + (c.address       ? `\nالعنوان: ${c.address}`        : "")
          + (c.phone         ? `\nالتليفون: ${c.phone}`          : "")
          + (c.opening_hours ? `\nمواعيد العمل: ${c.opening_hours}` : "")
          + (clinics.length > 1 ? `\n\nيوجد ${clinics.length - 1} عيادة أخرى في النطاق، اسألني عنها.` : "");
      }
    }

    res.json({
      success: true,
      reply,
      clinics,
    });
  } catch (err) {
    console.error("clinics/emergency error:", err.message);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في خدمة الطوارئ، يرجى المحاولة مرة أخرى.",
    });
  }
});

module.exports = router;