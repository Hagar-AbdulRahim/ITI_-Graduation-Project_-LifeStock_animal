const express = require("express");
const router = express.Router();

const {
  createFarm,
  getMyFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  getFarmStats,
} = require("../controllers/Farm.controller");

const { createFarmValidator, updateFarmValidator, farmIdValidator } = require("../validation/farmValidation");
const validate = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

// all routes require a logged-in user
router.use(protect);

router.post("/",            ...createFarmValidator,                        validate, createFarm);
router.get("/",             getMyFarms);
router.get("/:id",          ...farmIdValidator,                            validate, getFarmById);
router.get("/:id/stats",    ...farmIdValidator,                            validate, getFarmStats);
router.put("/:id",          ...farmIdValidator, ...updateFarmValidator,    validate, updateFarm);
router.delete("/:id",       ...farmIdValidator,                            validate, deleteFarm);

module.exports = router;