const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── إنشاء المجلدات لو مش موجودة ──────────────────────────────────────────────
["./uploads/health-cases", "./uploads/audio"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.fieldname === "audio";
    cb(null, isAudio ? "./uploads/audio" : "./uploads/health-cases");
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === "audio" ? "audio" : "hc";
    cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`);
  },
});

const uploadMixed = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

module.exports = uploadMixed;