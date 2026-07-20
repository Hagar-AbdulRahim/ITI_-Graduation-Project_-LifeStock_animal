const multer = require("multer");
const path   = require("path");

// بنستخدم memory storage — الملف بيتقرأ ويتحلل فورًا ومبيتخزنش على القرص
// (على عكس رفع الصور اللي بيتخزن دايم في uploads/)
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = /\.(xlsx|xls|csv)$/i;
const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel",                                          // .xls
  "text/csv",
  "application/csv",
  "text/plain", // بعض المتصفحات بتبعت CSV بالنوع ده
];

const uploadSpreadsheet = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميجا كافية جدًا لشيت حيوانات
  fileFilter: (req, file, cb) => {
    const extOk  = ALLOWED_EXTENSIONS.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);

    if (extOk || mimeOk) return cb(null, true);
    return cb(new Error("الملف يجب أن يكون Excel (.xlsx/.xls) أو CSV فقط"), false);
  },
});

module.exports = uploadSpreadsheet;