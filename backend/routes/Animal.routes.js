const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "animals");
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("نوع الصورة غير مسموح — JPEG, PNG, WEBP فقط"), ok);
  },
});

const {
  createAnimal,
  getAnimalsByFarm,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
} = require("../controllers/Animal.controller");

const {
  createAnimalValidator,
  updateAnimalValidator,
  animalIdValidator,
} = require("../validation/animalValidation");

const validate    = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

// تطبيق الحماية على كافة المسارات أدناه
router.use(protect);

// مسار جلب كافة الحيوانات داخل مزرعة محددة
router.get("/farm/:farmId", getAnimalsByFarm);

// مسار إضافة حيوان جديد
router.post(
  "/",
  upload.single("image"),
  ...createAnimalValidator,
  validate,
  createAnimal
);

// مسار جلب بيانات حيوان واحد تفصيلياً
router.get(
  "/:id",
  ...animalIdValidator,
  validate,
  getAnimalById
);

// مسار تحديث بيانات حيوان
router.put(
  "/:id",
  upload.single("image"),
  ...animalIdValidator,
  ...updateAnimalValidator,
  validate,
  updateAnimal
);

// مسار حذف حيوان
router.delete(
  "/:id",
  ...animalIdValidator,
  validate,
  deleteAnimal
);

module.exports = router;