import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      toast.success('تم تسجيل الدخول بنجاح');
      navigate(getRoleHomePath(result.user?.role));
    } catch (error) {
      toast.error(error || 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbf9f6] font-sans">
      {/* Right Side - Image & Content */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden bg-[#154b23]">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Livestock cows in a green field"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        <div className="absolute inset-0 z-20 flex flex-col p-12 text-white justify-between">
          <div className="flex justify-start">
            <h2 className="text-xl font-bold">LivestockCare AI</h2>
          </div>
          
          <div className="flex flex-col mb-20 max-w-lg">
            <h3 className="text-3xl font-bold mb-4 leading-tight text-right">الذكاء الاصطناعي في خدمة الثروة الحيوانية</h3>
            <p className="text-lg text-white/90 leading-relaxed text-right">
              نحن نوفر لك الأدوات الذكية لمراقبة صحة قطيعك، تحسين الإنتاجية باستمرار بأحدث تقنيات التعلم الآلي.
            </p>
          </div>

          <div className="flex justify-start">
            <p className="text-xs text-white/70">© 2024 LivestockCare AI لتقنيات بيطرية مبتكرة. مستدام.</p>
          </div>
        </div>
      </div>
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#fbf9f6]">
        <div className="w-full max-w-md">
          <div className="text-right mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
            <p className="text-sm text-gray-600">مرحباً بك مجدداً! يرجى إدخال بياناتك للوصول إلى لوحة التحكم.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label="البريد الإلكتروني أو رقم الهاتف"
              placeholder="example@livestock.ai"
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

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#154b23] focus:ring-[#154b23] cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer select-none">
                  تذكرني
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-[#154b23] hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2"
              icon={<LogIn size={18} />}
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </Button>

            <div className="flex items-center justify-center gap-2 my-4">
              <span className="h-px flex-1 bg-gray-200"></span>
              <p className="text-sm text-gray-400 font-medium">أو تابع عبر</p>
              <span className="h-px flex-1 bg-gray-200"></span>
            </div>

            <div className="relative w-full flex justify-center">
              {/* Custom design custom Google button */}
              <button
                type="button"
                className="w-full py-2.5 border border-gray-200 rounded-full flex items-center justify-center gap-2 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm pointer-events-none"
              >
                <FcGoogle size={20} />
                <span>جوجل</span>
              </button>

              {/* Invisible GoogleLogin button overlay to obtain the real id_token */}
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
                      navigate(getRoleHomePath(res.data.user?.role));
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

            <p className="text-center text-sm text-gray-600 mt-6">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-[#154b23] font-bold hover:underline">
                أنشئ حساباً جديداً
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
