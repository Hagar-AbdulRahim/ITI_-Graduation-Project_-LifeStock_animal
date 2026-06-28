const express = require("express");
const router  = express.Router();

const {
  createVaccination,
  getVaccinationsByAnimal,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
} = require("../controllers/Vaccination.controller");

const {
  createVaccinationValidator,
  updateVaccinationValidator,
  vaccinationIdValidator,
} = require("../validation/vaccinationValidation");

const validate    = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

router.use(protect);

// جلب كل تطعيمات حيوان معين
router.get("/animal/:animalId", getVaccinationsByAnimal);

// CRUD
router.post(
  "/",
  [...createVaccinationValidator, validate],
  createVaccination
);

router.get(
  "/:id",
  [...vaccinationIdValidator, validate],
  getVaccinationById
);

router.put(
  "/:id",
  [...vaccinationIdValidator, ...updateVaccinationValidator, validate],
  updateVaccination
);

router.delete(
  "/:id",
  [...vaccinationIdValidator, validate],
  deleteVaccination
);


module.exports = router;