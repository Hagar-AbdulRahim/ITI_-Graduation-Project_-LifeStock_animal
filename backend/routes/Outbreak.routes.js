const express = require("express");
const router = express.Router();
const { getPublicOutbreaks, getPublicOutbreakById } = require("../controllers/Outbreak.controller");

// عام بالكامل — أي زائر (مسجل دخول أو لأ) يقدر يشوف الفاشيات النشطة
// (الدالتين مش بيستخدموا req.user خالص، فمفيش داعي لـ protect هنا)
router.get("/", getPublicOutbreaks);
router.get("/:id", getPublicOutbreakById);

module.exports = router;