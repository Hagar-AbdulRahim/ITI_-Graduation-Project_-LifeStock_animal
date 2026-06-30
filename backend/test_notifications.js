const axios = require('axios');

async function testNotifications() {
  console.log('\n🔍 اختبار ربط الإشعارات بالباك إند...\n');

  // 1. تسجيل الدخول
  let token;
  try {
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'sahmah227@gmail.com',
      password: '123456789'   // ← غيّر كلمة المرور لو غلط
    });
    token = loginRes.data.access_token || loginRes.data.token || loginRes.data.data?.token;
    console.log('✅ 1. تسجيل الدخول: نجح');
  } catch (err) {
    console.error('❌ 1. تسجيل الدخول فشل:', err.response?.data?.message || err.message);
    console.log('   → جرب بريد إلكتروني وكلمة مرور صح');
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 2. إنشاء إشعار حقيقي في الداتابيز
  let newNotifId;
  try {
    const mongoose = require('mongoose');
    require('dotenv').config({ path: '.env' });
    await mongoose.connect(process.env.MONGO_URI);
    const Notification = require('./models/notification');
    const User = require('./models/user');
    const user = await User.findOne({ email: 'sahmah227@gmail.com' });
    const notif = await Notification.create({
      user_id: user._id,
      title: '🧪 إشعار اختبار الربط',
      message: 'هذا الإشعار تم إنشاؤه للتحقق من أن الفرونت مربوط بالباك إند بشكل صحيح.',
      body: 'هذا الإشعار تم إنشاؤه للتحقق من أن الفرونت مربوط بالباك إند بشكل صحيح.',
      type: 'vaccination',
      is_read: false,
    });
    newNotifId = notif._id.toString();
    console.log('✅ 2. إنشاء إشعار في الداتابيز: نجح | ID:', newNotifId);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ 2. إنشاء الإشعار فشل:', err.message);
    process.exit(1);
  }

  // 3. جلب الإشعارات من الـ API
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/notifications', { headers });
    const found = res.data.data?.find(n => n._id === newNotifId);
    if (found) {
      console.log('✅ 3. GET /api/notifications: الإشعار موجود في الاستجابة ✅');
    } else {
      console.log('⚠️  3. GET /api/notifications: الإشعار غير موجود في الاستجابة');
    }
    console.log('   → عدد الإشعارات الكلي:', res.data.data?.length);
  } catch (err) {
    console.error('❌ 3. جلب الإشعارات فشل:', err.response?.data || err.message);
  }

  // 4. اختبار تعيين كمقروء
  try {
    await axios.put(`http://127.0.0.1:5000/api/notifications/${newNotifId}/read`, {}, { headers });
    console.log('✅ 4. PUT /:id/read: تم تعيين الإشعار كمقروء');
  } catch (err) {
    console.error('❌ 4. تعيين كمقروء فشل:', err.response?.data || err.message);
  }

  // 5. اختبار تعيين الكل كمقروء
  try {
    await axios.put('http://127.0.0.1:5000/api/notifications/read-all', {}, { headers });
    console.log('✅ 5. PUT /read-all: تم تعيين الكل كمقروء');
  } catch (err) {
    console.error('❌ 5. read-all فشل:', err.response?.data || err.message);
  }

  // 6. اختبار الحذف
  try {
    await axios.delete(`http://127.0.0.1:5000/api/notifications/${newNotifId}`, { headers });
    console.log('✅ 6. DELETE /:id: تم حذف الإشعار');
  } catch (err) {
    console.error('❌ 6. الحذف فشل:', err.response?.data || err.message);
  }

  console.log('\n🎉 انتهى الاختبار!\n');
}

testNotifications();
