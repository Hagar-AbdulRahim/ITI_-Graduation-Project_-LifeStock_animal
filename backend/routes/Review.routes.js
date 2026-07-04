const express = require("express");
const router  = express.Router();

const {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
} = require("../controllers/Review.controller");

const { createReviewValidator, reviewIdValidator } = require("../validation/reviewValidation");
const validate  = require("../middelwares/validationMW");
const { protect } = require("../middelwares/Auth.middleware");

// GET  /api/reviews  — public
router.get("/", getAllReviews);

// GET  /api/reviews/:id — public
router.get("/:id", ...reviewIdValidator, validate, getReviewById);

// Protected routes (require login)
router.use(protect);

// POST /api/reviews
router.post("/", ...createReviewValidator, validate, createReview);

// DELETE /api/reviews/:id
router.delete("/:id", ...reviewIdValidator, validate, deleteReview);

module.exports = router;
