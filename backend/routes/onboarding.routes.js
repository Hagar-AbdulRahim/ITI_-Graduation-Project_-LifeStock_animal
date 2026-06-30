const express = require("express");
const router  = express.Router();
const { param, body } = require("express-validator");

const { chat, confirm } = require("../controllers/Onboarding.controller");
const validate    = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

router.use(protect);

const animalIdParamValidator = [
  param("animalId").isMongoId().withMessage("معرّف الحيوان غير صحيح"),
];

// محادثة الـ Onboarding — استدعاء واحد لكل رسالة (من المزارع أو لبدء المحادثة)
router.post(
  "/:animalId/chat",
  [
    ...animalIdParamValidator,
    body("message").optional().isString(),
    body("history").optional().isArray(),
    validate,
  ],
  chat
);

// تأكيد وحفظ التاريخ المرضي واللقاحات المُجمَّعة من المحادثة
router.post(
  "/:animalId/confirm",
  [
    ...animalIdParamValidator,
    body("medical_history").optional().isArray(),
    body("vaccinations").optional().isArray(),
    validate,
  ],
  confirm
);

module.exports = router;