const express = require("express");
const router = express.Router();
const { protect } = require("../middelwares/Auth.middleware");
const { getPublicOutbreaks, getPublicOutbreakById } = require("../controllers/Outbreak.controller");

// أي مستخدم مسجل دخول (مش شرط أدمن) يقدر يشوف الفاشيات النشطة
router.use(protect);

router.get("/", getPublicOutbreaks);
router.get("/:id", getPublicOutbreakById);

module.exports = router;
