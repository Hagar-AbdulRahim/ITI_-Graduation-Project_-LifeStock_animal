import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otp = location.state?.otp;

  // If missing state, redirect back
  if (!email || !otp) {
    navigate('/forgot-password');
    return null;
  }

  const validate = () => {
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('يجب أن تحتوي كلمة المرور على حرف كبير');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('يجب أن تحتوي كلمة المرور على رقم');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await api.post('/api/auth/reset-password', {
        email,
        otp,
        new_password: password,
      });
      toast.success('تم تغيير كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن');
      navigate('/login');
    } catch (error) {
      if (!error.response) {
        toast.error('لا يمكن الاتصال بالخادم');
      } else {
        const responseData = error.response.data;
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const messages = responseData.errors.map(e => e.message).join(' | ');
          toast.error(messages);
        } else {
          toast.error(responseData?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbf9f6] font-sans overflow-x-hidden">
      {/* Right Side */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#154b23]">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Livestock farm"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 z-20 flex flex-col p-8 lg:p-12 text-white justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-extrabold tracking-wide">رعاية</h2>
          </div>
          <div className="flex flex-col mb-16 lg:mb-20 max-w-lg">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-right">تعيين كلمة مرور جديدة</h3>
            <p className="text-base lg:text-lg text-white/90 leading-relaxed text-right">
              اختر كلمة مرور قوية تحتوي على أحرف وأرقام لحماية حسابك.
            </p>
          </div>
          <p className="text-xs text-white/70">© 2024 رعاية. مستدام.</p>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 bg-[#fbf9f6]">
        <div className="w-full max-w-md">
          <div className="text-right mb-6 md:mb-8">
            <p className="text-sm font-extrabold text-[#1b4d2c] mb-2 tracking-wide">رعاية</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">تعيين كلمة مرور جديدة</h1>
            <p className="text-sm md:text-base text-gray-600">يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير ورقم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <Input
              id="password"
              label="كلمة المرور الجديدة"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              iconRight={<Lock size={18} />}
              iconLeft={
                showPassword ? (
                  <EyeOff size={18} onClick={() => setShowPassword(false)} className="cursor-pointer" />
                ) : (
                  <Eye size={18} onClick={() => setShowPassword(true)} className="cursor-pointer" />
                )
              }
            />

            {/* Confirm Password */}
            <Input
              id="confirmPassword"
              label="تأكيد كلمة المرور"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              iconRight={<Lock size={18} />}
              iconLeft={
                showConfirm ? (
                  <EyeOff size={18} onClick={() => setShowConfirm(false)} className="cursor-pointer" />
                ) : (
                  <Eye size={18} onClick={() => setShowConfirm(true)} className="cursor-pointer" />
                )
              }
            />

            {/* Password strength hints */}
            <div className="bg-white/50 border border-gray-150 rounded-xl p-4 space-y-2">
              <p className={`text-xs flex items-center gap-1.5 font-medium ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                <span>{password.length >= 8 ? '✓' : '○'}</span> 8 أحرف على الأقل
              </p>
              <p className={`text-xs flex items-center gap-1.5 font-medium ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span> حرف كبير واحد على الأقل
              </p>
              <p className={`text-xs flex items-center gap-1.5 font-medium ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                <span>{/[0-9]/.test(password) ? '✓' : '○'}</span> رقم واحد على الأقل
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full py-3 mt-2 min-h-[44px]"
              icon={<ArrowLeft size={18} />}
            >
              تغيير كلمة المرور
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}