const express = require("express");
const router  = express.Router();
const { body, validationResult } = require("express-validator");
const { protect }                = require("../middelwares/Auth.middleware");
const { getVaccineRecommendations } = require("../services/vaccineAdvisorService");

// مش محتاج authentication — الاستشارة عامة
router.post(
  "/recommend",
  [
    body("species")
      .isIn(["cattle", "sheep", "goat"])
      .withMessage("نوع الحيوان يجب أن يكون cattle أو sheep أو goat"),
    body("age_months")
      .isInt({ min: 1, max: 240 })
      .withMessage("العمر يجب أن يكون بين 1 و 240 شهر"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    try {
      const { species, age_months } = req.body;
      const data = await getVaccineRecommendations({ species, age_months: parseInt(age_months) });

      return res.json({ success: true, data });
    } catch (err) {
      console.error("vaccine advisor error:", err.message);
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء توليد التوصيات",
      });
    }
  }
);

module.exports = router;
