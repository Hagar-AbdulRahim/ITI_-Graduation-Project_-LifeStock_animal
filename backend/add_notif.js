const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function addNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ متصل بقاعدة البيانات');

    const Notification = require('./models/notification');
    const User = require('./models/user');

    // هنجيب أول مستخدم في الداتابيز (أو المستخدم بتاعك)
    const user = await User.findOne({ email: 'sahmah227@gmail.com' }) || await User.findOne();
    
    if (!user) {
      console.log('❌ مفيش أي مستخدمين في الداتابيز');
      process.exit(1);
    }

    await Notification.create({
      user_id: user._id,
      title: 'إشعار حقيقي من الباك إند 🚀',
      message: 'أهلاً بيكي! هذا الإشعار يثبت أن صفحة الإشعارات تعمل ومتصلة بقاعدة البيانات بنجاح تام.',
      type: 'default',
      is_read: false
    });

    console.log(`✅ تم إضافة إشعار بنجاح للمستخدم: ${user.name || user.email}`);
    console.log('🔄 ارجعي للمتصفح واعملي Refresh للصفحة هتلاقي الإشعار ظهر!');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ خطأ:', err);
  }
}

addNotification();
