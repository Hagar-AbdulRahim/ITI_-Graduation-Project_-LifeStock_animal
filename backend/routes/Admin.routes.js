const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middelwares/Auth.middleware");
const {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUser,
  deleteUser,
  getFarms,
  getFarmById,
  deleteFarm,
  getAnimals,
  getHealthCases,
  updateHealthCase,
  getConsultations,
  getOutbreaks,
  createOutbreak,
  resolveOutbreak,
  getClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  getKnowledgeBaseStats,
  rebuildKnowledgeBase,
  getNotifications,
  broadcastNotification,
  getUsersGrowth,
  getHealthTrends,
  getVaccinationAnalytics,
} = require("../controllers/Admin.controller");

router.use(protect, authorize("admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/stats", getDashboardStats);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.put("/users/:id/toggle", toggleUser);
router.delete("/users/:id", deleteUser);

router.get("/farms", getFarms);
router.get("/farms/:id", getFarmById);
router.delete("/farms/:id", deleteFarm);

router.get("/animals", getAnimals);

router.get("/health-cases", getHealthCases);
router.put("/health-cases/:id", updateHealthCase);

router.get("/consultations", getConsultations);

router.get("/clinics", getClinics);
router.post("/clinics", createClinic);
router.put("/clinics/:id", updateClinic);
router.delete("/clinics/:id", deleteClinic);

router.get("/knowledge/stats", getKnowledgeBaseStats);
router.post("/knowledge/rebuild", rebuildKnowledgeBase);

router.get("/outbreaks", getOutbreaks);
router.post("/outbreaks", createOutbreak);
router.put("/outbreaks/:id/resolve", resolveOutbreak);

router.get("/notifications", getNotifications);
router.post("/notifications/broadcast", broadcastNotification);

router.get("/analytics/users-growth", getUsersGrowth);
router.get("/analytics/health-trends", getHealthTrends);
router.get("/analytics/vaccinations", getVaccinationAnalytics);

module.exports = router;
