const express = require("express");
const router  = express.Router();

const {
  createAnimal,
  getAnimalsByFarm,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
  searchAnimals,
  downloadAnimalImportTemplate,
  bulkImportAnimals,
} = require("../controllers/Animal.controller");

const uploadSpreadsheet = require("../middelwares/UploadSpreadsheet");

const {
  createAnimalValidator,
  updateAnimalValidator,
  animalIdValidator,
} = require("../validation/animalValidation");

const validate    = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

// تطبيق الحماية على كافة المسارات أدناه
router.use(protect);

// مسار البحث الشامل عن الحيوانات للمستخدم
router.get("/search", searchAnimals);

// مسار جلب كافة الحيوانات داخل مزرعة محددة
router.get("/farm/:farmId", getAnimalsByFarm);

// تحميل قالب Excel فاضي لإضافة الحيوانات دفعة واحدة
router.get("/bulk-import/template", downloadAnimalImportTemplate);

// استيراد جماعي للحيوانات من ملف Excel/CSV — الصفوف الصح بتتحفظ والغلط بيترفض بس
router.post("/bulk-import", uploadSpreadsheet.single("file"), bulkImportAnimals);

// مسار إضافة حيوان جديد
router.post(
  "/",
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