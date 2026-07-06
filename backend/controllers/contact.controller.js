const ContactMessage = require('../models/contact');
const { sendContactUsEmail } = require('../config/email');

// ── POST /api/contact ────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newContactMessage = await ContactMessage.create({
      user: req.user._id,
      name,
      email,
      subject,
      message,
    });

    // Send email notification in the background
    sendContactUsEmail({ name, email, subject, message }).catch(err => {
      console.error('Failed to send contact email:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً',
      data: newContactMessage,
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم أثناء إرسال الرسالة',
    });
  }
};

// ── GET /api/contact ─────────────────────────────────────────────────────────
const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    console.error('getAllMessages error:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم أثناء جلب الرسائل',
    });
  }
};

module.exports = { sendMessage, getAllMessages };
