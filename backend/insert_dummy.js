const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Notification = require('./models/notification');
const User = require('./models/user');

async function insertDummy() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/livestock');
    console.log("Connected to DB");
    
    const user = await User.findOne({ email: 'melwheshiy@gmail.com' });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }
    
    await Notification.create({
      user_id: user._id,
      title: "إشعار تجريبي جديد 🎉",
      message: "هذا الإشعار تم توليده لاختبار تصميم وشكل صفحة الإشعارات وعمل الأزرار (مقروء/حذف).",
      type: "vaccination",
      is_read: false
    });
    
    console.log("Dummy notification inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}
insertDummy();
