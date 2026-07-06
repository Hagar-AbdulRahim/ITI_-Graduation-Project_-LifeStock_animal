const { check } = require('express-validator');

exports.contactValidationRules = () => {
  return [
    check('name')
      .notEmpty()
      .withMessage('الاسم مطلوب')
      .isLength({ min: 2 })
      .withMessage('يجب أن يكون الاسم أكثر من حرفين'),
    check('email')
      .notEmpty()
      .withMessage('البريد الإلكتروني مطلوب')
      .isEmail()
      .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
    check('subject')
      .notEmpty()
      .withMessage('موضوع الرسالة مطلوب')
      .isLength({ min: 2 })
      .withMessage('موضوع الرسالة قصير جداً'),
    check('message')
      .notEmpty()
      .withMessage('الرسالة مطلوبة')
      .isLength({ min: 10 })
      .withMessage('الرسالة يجب أن تحتوي على 10 أحرف على الأقل'),
  ];
};
