const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Notification = require('./models/notification');
const User = require('./models/user');

async function createNotification() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGO_URI);
    
    // هنجيب حسابك (أول حساب في الداتابيز أو حسابك اللي مسجلة بيه)
    // لو عندك إيميل معين بتسجلي بيه ممكن تبدلي السطر ده بـ: await User.findOne({ email: 'your-email@example.com' })
    const user = await User.findOne(); 
    
    if (!user) {
      console.log('❌ لم يتم العثور على أي مستخدم في قاعدة البيانات.');
      return;
    }

    // إنشاء الإشعار
    const notif = await Notification.create({
      user_id: user._id,
      title: 'إشعار تجريبي حقيقي 🚀',
      message: 'هذا إشعار حقيقي تم إضافته مباشرة لقاعدة البيانات للتأكد من عمل النظام بشكل سليم.',
      body: 'هذا إشعار حقيقي تم إضافته مباشرة لقاعدة البيانات للتأكد من عمل النظام بشكل سليم.',
      type: 'health', // نوع الإشعار (صحة)
      is_read: false,
    });

    console.log('✅ تم إنشاء الإشعار بنجاح للمستخدم:', user.email);
    
  } catch (err) {
    console.error('❌ حدث خطأ:', err);
  } finally {
    await mongoose.disconnect();
  }
}

createNotification();
