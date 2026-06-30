const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Notification = require('./models/notification');
const User = require('./models/user');

async function createTestNotification() {
  try {
    console.log('🔗 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ تم الاتصال بنجاح');

    // البحث عن المستخدم باستخدام الإيميل اللي شغالين بيه
    const user = await User.findOne({ email: 'sahmah227@gmail.com' });
    
    if (!user) {
      console.log('❌ لم يتم العثور على المستخدم sahmah227@gmail.com');
      process.exit(1);
    }

    console.log(`👤 تم العثور على المستخدم: ${user.name}`);

    // إضافة الإشعار
    const notif = await Notification.create({
      user_id: user._id,
      title: 'إشعار اختبار حقيقي 🚀',
      message: 'هذا الإشعار جاء مباشرة من الباك إند للتأكد من أن الربط يعمل بشكل ممتاز!',
      body: 'هذا الإشعار جاء مباشرة من الباك إند للتأكد من أن الربط يعمل بشكل ممتاز!',
      type: 'default',
      is_read: false,
    });

    console.log('✅ تم إضافة الإشعار بنجاح! ID:', notif._id.toString());
    
  } catch (err) {
    console.error('❌ خطأ:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم إغلاق الاتصال');
  }
}

createTestNotification();
