const User  = require("../models/user");
const Farm = require("../models/farm");
const Animal = require("../models/animal");
const HealthCase = require("../models/healthCase");
const Vaccination = require("../models/vaccination");
const Consultation = require("../models/Consultation");
const bcrypt = require("bcryptjs");

// ════════════════════════════════════════════════════════════════════════════
// GET /api/users/me  — جلب بيانات المستخدم الحالي
// ════════════════════════════════════════════════════════════════════════════
const getMe = async (req, res) => {
  try {
    // req.user موجود من الـ protect middleware
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/users/me  — تعديل بيانات الملف الشخصي
// ════════════════════════════════════════════════════════════════════════════
const updateMe = async (req, res) => {
  try {
    const ALLOWED = ["name", "phone", "governorate", "notifications_enabled", "fcm_token"];

    // نقي الـ body من أي حقول مش مسموح بتعديلها
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => ALLOWED.includes(key))
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "لا توجد حقول صحيحة للتعديل",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/users/me/password  — تغيير كلمة المرور
// (بس لـ local users — Google users مش عندهم password)
// ════════════════════════════════════════════════════════════════════════════
const changePassword = async (req, res) => {
  try {
    if (req.user.auth_provider === "google") {
      return res.status(400).json({
        success: false,
        message: "حسابك مرتبط بـ Google — لا يمكن تغيير كلمة المرور",
      });
    }

    const { current_password, new_password } = req.body;

    // جيب الـ password من الداتابيز (select: false في الموديل)
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة المرور الحالية غير صحيحة",
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور الجديدة يجب أن تختلف عن الحالية",
      });
    }

    user.password = new_password; // الـ pre-save hook بيعمل hash تلقائياً
    await user.save();

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/users/me/fcm-token  — تحديث FCM token (بيُستدعى من الـ frontend تلقائياً)
// ════════════════════════════════════════════════════════════════════════════
const updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).json({ success: false, message: "fcm_token مطلوب" });
    }

    await User.findByIdAndUpdate(req.user._id, { fcm_token });

    res.json({ success: true, message: "تم تحديث رمز الإشعارات" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// DELETE /api/users/me  — حذف الحساب (Hard Delete with Cascade)
// يتم حذف المستخدم وكافة بياناته المرتبطة به نهائياً بناءً على طلب المستخدم
// ════════════════════════════════════════════════════════════════════════════
const deleteMe = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Delete all consultations requested by the user
    await Consultation.deleteMany({ user_id: userId });

    // 2. Find all farms for this user
    const farms = await Farm.find({ user_id: userId });
    const farmIds = farms.map((f) => f._id);

    if (farmIds.length > 0) {
      // 3. Find all animals for these farms
      const animals = await Animal.find({ farm_id: { $in: farmIds } });
      const animalIds = animals.map((a) => a._id);

      if (animalIds.length > 0) {
        // 4. Delete all health cases and vaccinations for these animals
        await HealthCase.deleteMany({ animal_id: { $in: animalIds } });
        await Vaccination.deleteMany({ animal_id: { $in: animalIds } });
      }

      // 5. Delete all animals and farms
      await Animal.deleteMany({ farm_id: { $in: farmIds } });
      await Farm.deleteMany({ user_id: userId });
    }

    // 6. Delete the user completely
    await User.findByIdAndDelete(userId);

    // مسح الـ refresh token cookie
    res.clearCookie("refreshToken", { path: "/api/auth" });

    res.json({ success: true, message: "تم حذف الحساب وكافة المزارع والحيوانات الخاصة بك نهائياً." });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const updatePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      push_subscription: subscription || null,
    });
    res.json({ success: true, message: subscription ? "تم حفظ الاشتراك" : "تم إلغاء الاشتراك" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { getMe, updateMe, changePassword, updateFcmToken, deleteMe, updatePushSubscription };

