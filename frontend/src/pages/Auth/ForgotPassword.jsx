import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/auth/forgot-password', { email });
      toast.success('تم إرسال كود التحقق إلى بريدك الإلكتروني');
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      if (!error.response) {
        toast.error('لا يمكن الاتصال بالخادم');
      } else {
        toast.error(error.response?.data?.message || 'حدث خطأ أثناء الإرسال');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbf9f6] font-sans overflow-x-hidden">
      {/* Right Side - Image */}
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
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-right">استعادة حسابك بكل سهولة</h3>
            <p className="text-base lg:text-lg text-white/90 leading-relaxed text-right">
              أدخل بريدك الإلكتروني وسنرسل لك كود للتحقق لإعادة تعيين كلمة المرور.
            </p>
          </div>
          <p className="text-xs text-white/70">© 2024 رعاية. مستدام.</p>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 bg-[#fbf9f6]">
        <div className="w-full max-w-md">
          <div className="text-right mb-6 md:mb-8">
            <p className="text-3xl font-extrabold text-[#1b4d2c] mb-2 tracking-wide">رعاية</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
            <p className="text-sm md:text-base text-gray-600">أدخل بريدك الإلكتروني وسنرسل لك كود التحقق لإعادة تعيين كلمة المرور.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="البريد الإلكتروني"
              placeholder="example@livestock.ai"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              iconRight={<Mail size={18} />}
            />

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full py-3 mt-2 min-h-[44px]"
              icon={<ArrowLeft size={18} />}
            >
              إرسال كود التحقق
            </Button>

            <p className="text-center text-sm md:text-base text-gray-600 mt-6">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="text-[#154b23] font-bold hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}