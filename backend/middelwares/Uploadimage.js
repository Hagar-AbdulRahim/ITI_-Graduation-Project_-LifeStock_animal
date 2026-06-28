const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── مجلد حفظ صور الحالات الصحية ─────────────────────────────────────────────
const uploadDir = "./uploads/health-cases";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `hc-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`);
  },
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // قمت برفع الحد لـ 15 ميجا لتستوعب الصور عالية الجودة من أي موبايل
 fileFilter: (req, file, cb) => {
    // 1. فحص لو المتصفح/بوستمان معرّف الفايل كصورة
    const isImageMime = file.mimetype && file.mimetype.startsWith("image/");
    
    // 2. فحص أمان إضافي عن طريق امتداد الفايل نفسه (ليشمل jfif, jpg, png, tiff.. إلخ)
    const allowedExtensions = /jpeg|jpg|png|webp|gif|jfif|bmp/i;
    const isImageExt = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    // لو نجح أي فحص من الاثنين، نمرر الملف بسلام
    if (isImageMime || isImageExt) {
      return cb(null, true);
    } else {
      return cb(new Error("الملف المرفوع يجب أن يكون صورة فقط!"), false);
    }
  
  },
});

module.exports = uploadImage;