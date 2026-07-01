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
 *
 * Query params:
 *   lat, lng   (اختياري) — إحداثيات GPS من الفرونت
 *   radius     (اختياري) — نطاق البحث بالمتر (افتراضي 10000)
 *
 * لو lat/lng مش موجودين:
 *   1. بيحاول يجيب إحداثيات المحافظة من الـ hardcoded map
 *   2. لو مش موجودة بيجرب Nominatim
 */
router.get(
  "/nearby",
  [
    query("lat").optional().isFloat({ min: -90,   max: 90   }).withMessage("lat غير صحيحة"),
    query("lng").optional().isFloat({ min: -180,  max: 180  }).withMessage("lng غير صحيحة"),
    query("radius").optional().isInt({ min: 500, max: 50000 }).withMessage("radius لازم بين 500 و 50000 متر"),
  ],
  validate,
  async (req, res) => {
    try {
      let { lat, lng, radius } = req.query;
      let location_source = "gps";

      if (!lat || !lng) {
        const governorate = req.query.governorate;

        // أولاً: من الـ hardcoded map
        let coords = getCoordinatesByGovernorate(governorate);

        // ثانياً: Nominatim fallback
        if (!coords) {
          coords = await geocodeGovernorate(governorate);
        }

        if (!coords) {
          return res.status(400).json({
            success: false,
            message: "تعذّر تحديد موقعك. فعّل الـ GPS أو حدّث محافظتك في الإعدادات.",
          });
        }

        lat            = coords.lat;
        lng            = coords.lng;
        location_source = "governorate";
      } else {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
      }

      // findNearbyClinics بقى بيرجع [] لو كل الـ Overpass mirrors فشلوا
      // بدل ما يرمي error، فالـ catch هنا بقى مخصص لأخطاء غير متوقعة فعلاً
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

router.post("/emergency", async (req, res) => {
  try {
    const { message, lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "أرسلي lat و lng من الـ GPS",
      });
    }

    // 1. جيب العيادات القريبة
    // findNearbyClinics بقى مش بيرمي exception حتى لو Overpass كله واقع،
    // بيرجع [] في أسوأ حالة عشان الشات يكمل شغل
    const clinics = await findNearbyClinics({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    // 2. فرمت بيانات العيادات للـ prompt
    const clinicsText = clinics.length === 0
      ? "لا توجد عيادات بيطرية مسجلة في نطاق 10 كم من موقعك."
      : clinics.map((c, i) =>
          `${i + 1}. ${c.name}
   المسافة: ${c.distance_km} كم
   العنوان: ${c.address || "غير متاح"}
   التليفون: ${c.phone || "غير متاح"}
   مواعيد العمل: ${c.opening_hours || "غير متاح"}`
        ).join("\n\n");

    // 3. Gemini يجاوب على سؤال المستخدم بناءً على البيانات
    const prompt = `
أنت مساعد بيطري طارئ. المزارع يحتاج مساعدة عاجلة.

العيادات البيطرية القريبة من موقعه:
${clinicsText}

سؤال المزارع: ${message || "محتاج أقرب عيادة بيطرية"}

أجب بالعربية البسيطة. لو سأل عن عيادة معينة أو مواعيد، أجبه من البيانات اللي عندك.
لا تخترع معلومات مش موجودة في البيانات.
`.trim();

    // نفصل استدعاء Gemini في try/catch مستقل عشان لو هو اللي فشل
    // (بطء الشبكة، quota، إلخ) نرجع رد افتراضي بناءً على بيانات العيادات
    // بدل ما نكسر الطلب بالكامل بـ 500
    let reply;
    try {
      const result = await chatModel.generateContent([{ text: prompt }]);
      reply = result.response.text().trim();
    } catch (geminiErr) {
      console.error("Gemini error in /emergency:", geminiErr.message);
      reply = clinics.length === 0
        ? "لا توجد عيادات بيطرية مسجلة في نطاق 10 كم من موقعك حالياً. جرّب توسيع نطاق البحث أو تواصل مع أقرب طبيب بيطري تعرفه."
        : `أقرب عيادة ليك هي "${clinics[0].name}" على بُعد ${clinics[0].distance_km} كم.${clinics[0].phone ? ` التليفون: ${clinics[0].phone}` : ""}`;
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
      message: "حدث خطأ في خدمة الطوارئ",
    });
  }
});

module.exports = router;