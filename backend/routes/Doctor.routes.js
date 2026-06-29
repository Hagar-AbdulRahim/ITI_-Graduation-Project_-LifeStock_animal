const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middelwares/Auth.middleware");
const {
  getDashboardStats,
  getHealthCases,
  reviewHealthCase,
  getConsultations,
  respondConsultation,
  getOutbreaks,
} = require("../controllers/Doctor.controller");

router.use(protect, authorize("doctor", "admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/health-cases", getHealthCases);
router.put("/health-cases/:id/review", reviewHealthCase);
router.get("/consultations", getConsultations);
router.put("/consultations/:id/respond", respondConsultation);
router.get("/outbreaks", getOutbreaks);

module.exports = router;
