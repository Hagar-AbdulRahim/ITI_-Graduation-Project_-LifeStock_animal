const Review = require("../models/review");
const { isStaff } = require("../utils/accessControl");

// ── POST /api/reviews ────────────────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // منع اليوزر من إضافة أكتر من مراجعة واحدة
    const existingReview = await Review.findOne({ userId: req.user._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "لقد قمت بإضافة مراجعة من قبل. يمكنك حذفها وإضافة مراجعة جديدة.",
      });
    }

    const review = await Review.create({
      userId:    req.user._id,
      userName:  req.user.name,
      userEmail: req.user.email,
      rating,
      comment,
    });

    // إخفاء الإيميل من الاستجابة
    const safeReview = await Review.findById(review._id).select("-userEmail -__v");

    return res.status(201).json({
      success: true,
      message: "تم إضافة مراجعتك بنجاح",
      data: safeReview,
    });
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

// ── GET /api/reviews ─────────────────────────────────────────────────────────
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ created_at: -1 })
      .select("-userEmail -__v");

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

// ── GET /api/reviews/:id ─────────────────────────────────────────────────────
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).select("-userEmail -__v");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "المراجعة غير موجودة",
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    console.error("getReviewById error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

// ── DELETE /api/reviews/:id ──────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "المراجعة غير موجودة",
      });
    }

    // فقط صاحب المراجعة أو الأدمن يقدر يحذف
    if (
      review.userId.toString() !== req.user._id.toString() &&
      !isStaff(req.user)
    ) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية لحذف هذه المراجعة",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "تم حذف المراجعة بنجاح",
    });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

module.exports = { createReview, getAllReviews, getReviewById, deleteReview };
