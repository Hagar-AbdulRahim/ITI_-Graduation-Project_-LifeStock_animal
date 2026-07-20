import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Phone, MapPin, Lock, Save, Trash2, ArrowRight, Loader2, Mail } from 'lucide-react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { fetchProfile, logoutUser } from '../redux/authSlice';

export default function UserProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security'
  
  // Info Form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    governorate: user?.governorate || '',
  });
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    otp: '',
    new_password: '',
    confirm_password: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        governorate: user.governorate || '',
      });
    }
  }, [user]);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    try {
      await userService.updateProfile(formData);
      toast.success('تم تحديث البيانات بنجاح');
      dispatch(fetchProfile());
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await authService.forgotPassword(user.email);
      toast.success('تم إرسال كود التفعيل إلى بريدك الإلكتروني');
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء إرسال الكود');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error('كلمة المرور الجديدة غير متطابقة');
    }
    setIsUpdatingPassword(true);
    try {
      await authService.resetPassword({
        email: user.email,
        otp: passwordData.otp,
        new_password: passwordData.new_password
      });
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordData({ otp: '', new_password: '', confirm_password: '' });
      setOtpSent(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      toast.success('تم حذف الحساب بنجاح');
      dispatch(logoutUser());
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء حذف الحساب');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!user) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">الملف الشخصي</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">إدارة بيانات حسابك وإعدادات الأمان</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1b4d2c] to-[#2d5a1b] text-white flex items-center justify-center text-3xl font-bold shadow-md mb-4 border-4 border-green-50">
                {user.name?.charAt(0) || 'م'}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                نشط
              </div>
            </div>

            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-[#1b4d2c] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="w-4 h-4" />
                البيانات الأساسية
              </button>
              {user.auth_provider !== 'google' && (
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-[#1b4d2c] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Lock className="w-4 h-4" />
                  الأمان وكلمة المرور
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'info' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">المعلومات الشخصية</h3>
                <form onSubmit={handleInfoSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">الاسم بالكامل</label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#1b4d2c] focus:ring-1 focus:ring-[#1b4d2c] outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#1b4d2c] focus:ring-1 focus:ring-[#1b4d2c] outline-none transition-all text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">المحافظة</label>
                      <div className="relative">
                        <MapPin className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.governorate}
                          onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#1b4d2c] focus:ring-1 focus:ring-[#1b4d2c] outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none text-left"
                          dir="ltr"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingInfo}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1b4d2c] text-white rounded-xl text-sm font-bold hover:bg-[#153a21] transition-all shadow-sm disabled:opacity-70"
                    >
                      {isUpdatingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      حفظ التغييرات
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && user.auth_provider !== 'google' && (
              <div className="space-y-6">
                {/* Change Password Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#1b4d2c]" />
                    تغيير كلمة المرور
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    لتغيير كلمة المرور، سنقوم بإرسال كود تحقق إلى بريدك الإلكتروني المسجل لدينا.
                  </p>

                  {!otpSent ? (
                    <div className="flex justify-start">
                      <button
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1b4d2c] text-white rounded-xl text-sm font-bold hover:bg-[#153a21] transition-all shadow-sm disabled:opacity-70"
                      >
                        {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        إرسال كود التحقق
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">كود التحقق (OTP)</label>
                        <input
                          type="text"
                          value={passwordData.otp}
                          onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#1b4d2c] focus:ring-1 focus:ring-[#1b4d2c] outline-none transition-all text-center tracking-widest text-lg font-bold"
                          dir="ltr"
                          required
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#1b4d2c] focus:ring-1 focus:ring-[#1b4d2c] outline-none transition-all text-left"
                          dir="ltr"
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">تأكيد كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#1b4d2c] focus:ring-1 focus:ring-[#1b4d2c] outline-none transition-all text-left"
                          dir="ltr"
                          required
                        />
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-sm text-gray-500 font-bold hover:text-gray-700"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1b4d2c] text-white rounded-xl text-sm font-bold hover:bg-[#153a21] transition-all shadow-sm disabled:opacity-70"
                        >
                          {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          تحديث كلمة المرور
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Danger Zone Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-red-100 shadow-sm">
                  <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    حذف الحساب
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    بمجرد حذفك للحساب، سيتم إيقافه ولن تتمكن من تسجيل الدخول. ستحتاج إلى التواصل مع الدعم الفني لاستعادته في حال رغبت بذلك.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-200 shadow-sm"
                  >
                    حذف حسابي نهائياً
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">هل أنت متأكد من حذف حسابك؟</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              هذا الإجراء سيقوم بتعطيل حسابك ولن تتمكن من الوصول إلى مزارعك وحيواناتك بعد الآن.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                إلغاء التراجع
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
