const express = require("express");
const router = express.Router();

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
const validate = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
});

router.use(protect);

// get all animals for a specific farm
router.get("/farm/:farmId", getAnimalsByFarm);

// CRUD by animal id
router.post("/", upload.single("image"), ...createAnimalValidator, validate, createAnimal);
router.get("/:id", ...animalIdValidator, validate, getAnimalById);
router.put("/:id", upload.single("image"), ...animalIdValidator, ...updateAnimalValidator, validate, updateAnimal);
router.delete("/:id", ...animalIdValidator, validate, deleteAnimal);

module.exports = router;