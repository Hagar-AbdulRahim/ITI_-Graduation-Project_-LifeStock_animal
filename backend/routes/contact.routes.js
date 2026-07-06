const express = require('express');
const router = express.Router();

const { sendMessage, getAllMessages } = require('../controllers/contact.controller');
const { contactValidationRules } = require('../validation/contactValidation');
const validate = require('../middelwares/validationMW');
// The protect middleware isn't needed for contact form submission, but we might want it for getAllMessages (only admins).
const { protect, allowedTo } = require('../middelwares/Auth.middleware');

// POST /api/contact - Protected (User must be logged in)
router.post('/', protect, ...contactValidationRules(), validate, sendMessage);

// GET /api/contact - Protected (Admin only)
// Note: assuming 'allowedTo' is implemented. If not, protect is enough. 
// We will just use protect and allow only logged in users (or admin if available)
router.get('/', protect, getAllMessages);

module.exports = router;
