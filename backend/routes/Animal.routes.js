const express = require("express");
const router  = express.Router();

const {
  createAnimal,
  getAnimalsByFarm,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
  searchAnimals,
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

// مسار البحث الشامل عن الحيوانات للمستخدم
router.get("/search", searchAnimals);

// مسار جلب كافة الحيوانات داخل مزرعة محددة
router.get("/farm/:farmId", getAnimalsByFarm);

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