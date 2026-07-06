const express = require("express");
const router  = express.Router();

const {
  diagnose,
  diagnoseVoice,
  diagnoseImage,
  getCasesByAnimal,
  getMyConsultations,
  getCaseById,
  resolveCase,
} = require("../controllers/Healthcase.controller");

const {
  diagnoseValidator,
  diagnoseImageValidator,
  resolveCaseValidator,
  caseIdValidator,
  animalIdParamValidator,
} = require("../validation/healthCaseValidation");

const validate     = require("../middelwares/validationMW");
const { protect }  = require("../middelwares/Auth.middleware");
const uploadAudio  = require("../middelwares/Uploadaudio");
const uploadImage  = require("../middelwares/Uploadimage");
const uploadMixed  = require("../middelwares/Uploadmixed");

router.use(protect);

// التشخيص الرئيسي بالـ AI (نص)
router.post("/diagnose", [...diagnoseValidator, validate], diagnose);

// التشخيص بالصورة — يستقبل ملف صورة تحت اسم الحقل "image"
// باقي الحقول (animal_id, species, symptoms) تُرسل كـ form-data text fields بجانب الملف
router.post(
  "/diagnose/image",
  uploadMixed.fields([
    { name: "images", maxCount: 4 },
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  [...diagnoseImageValidator, validate],
  diagnoseImage
);

// التشخيص بالصوت — يستقبل ملف صوتي تحت اسم الحقل "audio"
// باقي الحقول (animal_id, species) تُرسل كـ form-data text fields بجانب الملف
router.post("/diagnose/voice", uploadAudio.single("audio"), diagnoseVoice);

// تاريخ حيوان معين
router.get("/animal/:animalId", [...animalIdParamValidator, validate], getCasesByAnimal);

// استشارات عامة للمستخدم
router.get("/consultations", getMyConsultations);

// تفاصيل حالة واحدة
router.get("/:id", [...caseIdValidator, validate], getCaseById);

// إغلاق حالة
router.put("/:id/resolve", [...resolveCaseValidator, validate], resolveCase);

module.exports = router;