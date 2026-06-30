const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── إعداد مجلد رفع الملفات الصوتية ────────────────────────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads", "audio");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // 🔍 للتشخيص: هنطبع بيانات الملف اللي وصل للسيرفر
  console.log(`🎤 Multer receiving file: OriginalName: [${file.originalname}], MimeType: [${file.mimetype}]`);

  // الصيغ المدعومة (شاملة كل أنواع الملفات الصوتية اللي ممكن تطلع من الموبايل/المتصفح)
  const allowedMimeTypes = [
    "audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", 
    "audio/m4a", "audio/ogg", "audio/x-m4a", "application/octet-stream", "audio/aac"
  ];
  
  const isMimeOk = allowedMimeTypes.includes(file.mimetype.toLowerCase());
  const isExtOk = /webm|mp3|wav|m4a|ogg|mpeg|aac/i.test(path.extname(file.originalname).toLowerCase());

  if (isMimeOk || isExtOk) {
    cb(null, true);
  } else {
    console.warn(`❌ Multer rejected file: ${file.originalname} (Type: ${file.mimetype})`);
    cb(new Error("نوع الملف الصوتي غير مسموح"), false);
  }
};

const uploadAudio = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB كحد أقصى للأمان
  fileFilter,
});

module.exports = uploadAudio;