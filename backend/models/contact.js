const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'يرجى إدخال الاسم'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'يرجى إدخال البريد الإلكتروني'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'يرجى إدخال بريد إلكتروني صحيح',
      ],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'يرجى إدخال الموضوع'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'يرجى إدخال الرسالة'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactSchema);
