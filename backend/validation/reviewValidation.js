const { body, param } = require("express-validator");

const createReviewValidator = [
  body("rating")
    .notEmpty().withMessage("التقييم مطلوب")
    .isInt({ min: 1, max: 5 }).withMessage("التقييم يجب أن يكون بين 1 و5"),

  body("comment")
    .trim()
    .notEmpty().withMessage("التعليق مطلوب")
    .isLength({ max: 500 }).withMessage("التعليق يجب ألا يتجاوز 500 حرف"),
];

const reviewIdValidator = [
  param("id").isMongoId().withMessage("معرّف المراجعة غير صحيح"),
];

module.exports = { createReviewValidator, reviewIdValidator };
