const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/notification');
const User = require('./models/user');

async function resetAndTestNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    // 1. مسح كل الإشعارات القديمة الوهمية من الداتابيز
    await Notification.deleteMany({});
    console.log('🗑️ Deleted all old testing notifications for all users.');

    // 2. نجيب 2 يوزرس مختلفين
    const user1 = await User.findOne({ email: 're053174@gmail.com' }); // حساب ssss
    const user2 = await User.findOne({ email: 'sahmah227@gmail.com' }); // حساب سحر

    if (user1) {
      await Notification.create({
        user_id: user1._id,
        title: '🔔 إشعار خاص بحساب SSSS',
        message: 'مرحباً! هذا الإشعار يظهر فقط في حسابك (re053174@gmail.com) ولن يراه أي مستخدم آخر.',
        type: 'default',
        is_read: false
      });
      console.log(`✅ Created unique notification for ${user1.email}`);
    }

    if (user2) {
      await Notification.create({
        user_id: user2._id,
        title: '🐄 تنبيه لمزرعة سحر',
        message: 'مرحباً سحر! هذا الإشعار مخصص لك فقط في حساب (sahmah227@gmail.com).',
        type: 'vaccination',
        is_read: false
      });
      console.log(`✅ Created unique notification for ${user2.email}`);
    }

    console.log('🎉 Done!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

resetAndTestNotifications();
