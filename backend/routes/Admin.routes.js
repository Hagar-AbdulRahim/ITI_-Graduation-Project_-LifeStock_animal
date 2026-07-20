const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middelwares/Auth.middleware");
const {
  getDashboardStats,
  getUsers,
  getUserById,
  toggleUser,
  deleteUser,
  getClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  getOutbreaks,
  createOutbreak,
  resolveOutbreak,
  approveOutbreak,
  rejectOutbreak,
  getConsultations,
  getKnowledgeBaseStats,
  rebuildKnowledgeBase,
  getUsersGrowth,
  getOutbreakCandidates,
  getSymptomsStats,
  triggerOutbreakDetection,
  getNotifications,
  broadcastNotification,
  getFarms,
  getFarmById,
  getAnimals,
  getHealthCases,
  updateHealthCase,
} = require("../controllers/Admin.controller");

router.use(protect, authorize("admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/stats", getDashboardStats);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/toggle", toggleUser);
router.delete("/users/:id", deleteUser);

router.get("/clinics", getClinics);
router.post("/clinics", createClinic);
router.put("/clinics/:id", updateClinic);
router.delete("/clinics/:id", deleteClinic);

router.get("/outbreaks", getOutbreaks);
router.post("/outbreaks", createOutbreak);
router.put("/outbreaks/:id/resolve", resolveOutbreak);
router.put("/outbreaks/:id/approve", approveOutbreak);
router.put("/outbreaks/:id/reject", rejectOutbreak);

router.get("/consultations", getConsultations);

// Farms & Animals
router.get("/farms", getFarms);
router.get("/farms/:id", getFarmById);
router.get("/animals", getAnimals);

router.get("/health-cases", getHealthCases);
router.put("/health-cases/:id", updateHealthCase);

router.get("/knowledge/stats", getKnowledgeBaseStats);
router.post("/knowledge/rebuild", rebuildKnowledgeBase);

router.get("/analytics/users-growth", getUsersGrowth);

// Outbreak Analytics
router.get("/outbreak-analytics/candidates", getOutbreakCandidates);
router.get("/outbreak-analytics/symptoms", getSymptomsStats);
router.post("/outbreak-analytics/detect", triggerOutbreakDetection);

// Notifications
router.get("/notifications", getNotifications);
router.post("/notifications/broadcast", broadcastNotification);

module.exports = router;