import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft, LogIn } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginUser, setCredentials } from '../../redux/authSlice';
import toast from 'react-hot-toast';
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { getRoleHomePath } from '../../utils/roleRedirect';
import api from '../../services/api';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  const getRedirectPath = (role) => location.state?.from?.pathname || getRoleHomePath(role);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const action = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(action)) {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate(getRedirectPath(action.payload.user?.role), { replace: true });
      return;
    }

    const payload = action.payload;
    const isUnverified =
      payload !== null &&
      typeof payload === 'object' &&
      payload.email_verified === false;

    if (isUnverified) {
      setShowResend(true);
      setResendEmail(data.email);
      toast.error('يرجى تفعيل بريدك الإلكتروني أولاً');
    } else {
      const msg =
        typeof payload === 'string'
          ? payload
          : payload?.message || 'بيانات الدخول غير صحيحة';
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { email: resendEmail });
      toast.success('تم إرسال رابط التفعيل — تحقق من بريدك');
      setShowResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الإرسال، حاول تاني');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#154b23] md:bg-[#fbf9f6] font-sans overflow-x-hidden relative items-center justify-center">

      {/* ── Mobile Background (Solid) ── */}
      <div className="md:hidden absolute inset-0 z-0 bg-[#154b23]" />

      {/* ── Right Side - Image & Content (iPad & Desktop only) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] h-screen relative overflow-hidden bg-[#154b23] flex-shrink-0">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="صورة مزرعة"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        <div className="absolute inset-0 z-20 flex flex-col p-6 md:p-8 lg:p-12 text-white justify-between">
          <div className="flex justify-start">
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight drop-shadow-2xl">
              رعاية
            </h2>
          </div>
          
          <div className="flex flex-col mb-12 md:mb-16 lg:mb-20 max-w-lg">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 leading-tight text-right">الذكاء الاصطناعي في خدمة الثروة الحيوانية</h3>
            <p className="text-sm md:text-base lg:text-lg text-white/90 leading-relaxed text-right">
              نحن نوفر لك الأدوات الذكية لمراقبة صحة قطيعك، تحسين الإنتاجية باستمرار بأحدث تقنيات التعلم الآلي.
            </p>
          </div>

          <div className="flex justify-start">
            <p className="text-xs text-white/70">© 2024 <span className="font-extrabold">رعاية</span> لتقنيات بيطرية مبتكرة. مستدام.</p>
          </div>
        </div>
      </div>

      {/* ── Left Side - Form Card ── */}
      <div className="relative z-10 w-full md:w-1/2 lg:w-[55%] flex items-center justify-center px-4 py-8 sm:px-6 md:px-8">
        <div className="relative overflow-hidden w-full max-w-[380px] xs:max-w-md bg-transparent md:bg-transparent rounded-[32px] md:rounded-none p-6 sm:p-8 md:p-0 shadow-2xl md:shadow-none border border-white/20 md:border-none [&_label]:text-white md:[&_label]:text-gray-700">
          {/* Mobile Image Background for Form ONLY */}
          <div className="md:hidden absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="خلفية الفورم"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-20 text-right mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white md:text-gray-900 mb-4 text-center md:text-right">تسجيل الدخول</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 md:text-gray-600 text-center md:text-right">مرحباً بك مجدداً يرجى إدخال بياناتك للوصول إلى لوحة التحكم.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-20">
            <Input
              id="email"
              label="البريد الإلكتروني أو رقم الهاتف"
              placeholder="example@reaya.ai"
              type="text"
              iconRight={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email', {
                required: 'البريد الإلكتروني مطلوب',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'صيغة البريد الإلكتروني غير صحيحة',
                },
              })}
            />

            <Input
              id="password"
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              iconRight={<Lock size={18} />}
              iconLeft={
                showPassword ? (
                  <EyeOff size={18} onClick={() => setShowPassword(false)} className="cursor-pointer" />
                ) : (
                  <Eye size={18} onClick={() => setShowPassword(true)} className="cursor-pointer" />
                )
              }
              error={errors.password?.message}
              {...register('password', {
                required: 'كلمة المرور مطلوبة',
                minLength: {
                  value: 6,
                  message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                },
              })}
            />

            <div className="flex items-center justify-between mt-2 relative z-20">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#154b23] focus:ring-[#154b23] cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-xs sm:text-sm text-white md:text-gray-700 cursor-pointer select-none">
                  تذكرني
                </label>
              </div>
              <Link to="/forgot-password" className="text-xs sm:text-sm font-medium text-[#4ade80] md:text-[#154b23] hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1b4d2c] hover:bg-[#154b23] text-white text-sm sm:text-base shadow-lg shadow-[#1b4d2c]/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الدخول...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  تسجيل الدخول
                </span>
              )}
            </Button>

            {showResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full py-3 min-h-[44px] border border-[#154b23] rounded-full text-[#154b23] font-bold text-sm hover:bg-[#154b23]/5 transition-colors disabled:opacity-60"
              >
                {resendLoading ? 'جاري الإرسال...' : 'إعادة إرسال رابط التفعيل'}
              </button>
            )}

            <div className="relative flex items-center justify-center mt-6">
              <div className="absolute inset-x-0 border-t border-white/20 md:border-gray-200"></div>
              <span className="relative bg-black/60 md:bg-[#fbf9f6] px-4 text-xs text-gray-300 md:text-gray-500 font-medium backdrop-blur-sm md:backdrop-blur-none rounded-full md:rounded-none">
                أو المتابعة عبر
              </span>
            </div>

            <div className="relative w-full flex justify-center">
              <button
                type="button"
                className="w-full py-3 min-h-[44px] border border-gray-200 rounded-full flex items-center justify-center gap-2 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm pointer-events-none"
              >
                <FcGoogle size={20} />
                <span>جوجل</span>
              </button>

              <div className="absolute inset-0 opacity-[0.01] overflow-hidden cursor-pointer w-full h-full flex justify-center [&_iframe]:!w-full [&_iframe]:!h-full">
                <GoogleLogin
                  type="standard"
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  onSuccess={async (credentialResponse) => {
                    try {
                      const res = await axios.post(
                        "http://localhost:5000/api/auth/google",
                        {
                          id_token: credentialResponse.credential,
                        }
                      );

                      localStorage.setItem(
                        "token",
                        res.data.access_token
                      );

                      dispatch(setCredentials(res.data));
                      toast.success("تم تسجيل الدخول بنجاح");
                      navigate(getRedirectPath(res.data.user?.role), { replace: true });
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message ||
                          "فشل تسجيل الدخول بجوجل"
                      );
                    }
                  }}
                  onError={() => {
                    toast.error("فشل تسجيل الدخول بجوجل");
                  }}
                />
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm text-gray-200 md:text-gray-600 mt-6 font-medium">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-[#4ade80] md:text-[#1b4d2c] font-bold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
