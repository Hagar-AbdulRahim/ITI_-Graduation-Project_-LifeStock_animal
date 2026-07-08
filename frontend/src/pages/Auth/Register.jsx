import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft, User, Phone } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { registerUser } from '../../redux/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        governorate: 'القاهرة'
      };
      await dispatch(registerUser(payload)).unwrap();
      toast.success('تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب');
      navigate('/login');
    } catch (error) {
      // error here is a string from rejectWithValue
      toast.error(typeof error === 'string' ? error : 'حدث خطأ أثناء إنشاء الحساب');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbf9f6] font-sans overflow-x-hidden">
      {/* Right Side - Review Card overlay */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#154b23]">
        <div className="absolute inset-0 bg-black/10 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Green farm"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Content over image */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 lg:p-12">
          
          {/* Review Card */}
          <div className="bg-[#2c5b36]/80 backdrop-blur-md rounded-2xl p-6 lg:p-8 max-w-md border border-white/10 text-white shadow-xl">
            <div className="flex gap-1 mb-4 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-base lg:text-lg leading-relaxed mb-6 font-medium">
              "ساعدتنا رعاية في تقليل حالات الطوارئ بنسبة 40% من خلال التنبؤ الصحي الاستباقي. إنها الأداة الأهم في مزرعتنا اليوم."
            </p>
            <div className="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&h=100&q=80" alt="Doctor" className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" />
              <div>
                <h4 className="font-bold text-sm">د. إبراهيم القحطاني</h4>
                <p className="text-xs text-white/70">كبير الأطباء البيطريين، مزارع نجد</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="absolute bottom-8 lg:bottom-12 w-full px-8 lg:px-12">
            <div className="flex justify-around items-center border-t border-white/20 pt-6 lg:pt-8 text-white">
              <div className="text-center">
                <p className="text-xl lg:text-2xl font-bold"><AnimatedCounter value="24/7" /></p>
                <p className="text-xs lg:text-sm text-white/70">دعم تقني</p>
              </div>
              <div className="text-center">
                <p className="text-xl lg:text-2xl font-bold"><AnimatedCounter value="98%" /></p>
                <p className="text-xs lg:text-sm text-white/70">دقة التشخيص</p>
              </div>
              <div className="text-center">
                <p className="text-xl lg:text-2xl font-bold"><AnimatedCounter value="+15k" /></p>
                <p className="text-xs lg:text-sm text-white/70">رأس ماشية</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 bg-[#154b23] md:bg-[#fbf9f6] relative overflow-hidden">
        
        {/* لمسات تصميمية ناعمة للموبايل فقط */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl md:hidden z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-3xl md:hidden z-0"></div>
        <div className="w-full max-w-md relative z-10 bg-white/85 md:bg-transparent p-6 sm:p-8 md:p-0 rounded-3xl md:rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.05)] md:shadow-none border border-white/40 md:border-none backdrop-blur-md md:backdrop-blur-none">
          <div className="text-right mb-6 md:mb-8">
            <p className="text-sm font-extrabold text-[#1b4d2c] mb-2 tracking-wide">رعاية</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">أنشئ حسابك الجديد</h1>
            <p className="text-sm md:text-base text-gray-600">ابدأ رحلتك في إدارة الثروة الحيوانية بالذكاء الاصطناعي اليوم.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="fullName"
              label="الاسم الكامل"
              placeholder="أحمد محمد"
              type="text"
              className="w-full"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'الاسم الكامل مطلوب',
              })}
            />

            <Input
              id="email"
              label="البريد الإلكتروني"
              placeholder="name@example.com"
              type="email"
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
              id="phone"
              label="رقم الهاتف"
              placeholder="+966 50 000 0000"
              type="tel"
              iconRight={<Phone size={18} />}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'رقم الهاتف مطلوب',
              })}
            />

            <Input
              id="password"
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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

            <div className="flex items-start gap-2 mt-2 pb-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-[#154b23] focus:ring-[#154b23] cursor-pointer flex-shrink-0"
                {...register('terms', { required: 'يجب الموافقة على الشروط' })}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed">
                أوافق على <span className="font-bold text-[#154b23]">الشروط والأحكام</span> و <span className="font-bold text-[#154b23]">سياسة الخصوصية</span>.
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-500 mt-0">{errors.terms.message}</p>}

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-3 mt-6 min-h-[44px]"
              icon={<ArrowLeft size={18} />}
            >
              إنشاء حساب
            </Button>
          </form>

          <p className="mt-6 md:mt-8 text-center text-sm md:text-base text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
