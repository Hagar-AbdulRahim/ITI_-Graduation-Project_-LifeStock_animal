const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/notification');
const User = require('./models/user');

async function seedNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ متصل بقاعدة البيانات...');

    // نجيب أول يوزر في السيستم
    const user = await User.findOne();
    if (!user) {
      console.log('❌ مفيش أي مستخدمين في الداتابيز!');
      process.exit(1);
    }

    // ننشئ إشعار حقيقي ليه
    const notif = await Notification.create({
      user_id: user._id,
      title: '🐄 إشعار من الباك إند!',
      message: 'تم التأكد بنجاح من أن واجهة المستخدم مربوطة بشكل ممتاز مع الخادم.',
      body: 'تم التأكد بنجاح من أن واجهة المستخدم مربوطة بشكل ممتاز مع الخادم.',
      type: 'vaccination',
      is_read: false,
    });

    console.log(`✅ تم إضافة إشعار جديد للمستخدم: ${user.email}`);
    console.log('🔄 ارجعي للمتصفح واعملي Refresh للصفحة هتلاقي الإشعار ظهر!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ حدث خطأ:', err);
    process.exit(1);
  }
}

seedNotification();
