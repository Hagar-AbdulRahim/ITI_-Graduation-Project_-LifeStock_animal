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

router.use(protect);

// get all animals for a specific farm
router.get("/farm/:farmId", getAnimalsByFarm);

// CRUD by animal id
router.post("/",    ...createAnimalValidator,                          validate, createAnimal);
router.get("/:id",  ...animalIdValidator,                              validate, getAnimalById);
router.put("/:id",  ...animalIdValidator, ...updateAnimalValidator,    validate, updateAnimal);
router.delete("/:id", ...animalIdValidator,                            validate, deleteAnimal);

module.exports = router;