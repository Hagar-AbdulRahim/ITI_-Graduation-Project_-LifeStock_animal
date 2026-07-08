import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import api from '../../services/api';

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // If user lands here without email, redirect
  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      toast.error('يرجى إدخال الكود المكون من 6 أرقام');
      return;
    }
    // We don't verify otp separately — we pass it directly to reset-password
    navigate('/reset-password', { state: { email, otp: otpString } });
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await api.post('/api/auth/forgot-password', { email });
      toast.success('تم إعادة إرسال الكود');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error('حدث خطأ أثناء إعادة الإرسال');
    } finally {
      setResendLoading(false);
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
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-right">تحقق من بريدك الإلكتروني</h3>
            <p className="text-base lg:text-lg text-white/90 leading-relaxed text-right">
              لقد أرسلنا كود مكون من 6 أرقام إلى بريدك الإلكتروني. أدخله للمتابعة.
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">أدخل كود التحقق</h1>
            <p className="text-sm md:text-base text-gray-600">
              تم إرسال كود مكون من 6 أرقام إلى:
              <br />
              <span className="font-semibold text-gray-800 dir-ltr inline-block mt-1 break-all">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste} dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border transition-all outline-none bg-white
                    ${digit ? 'border-[#154b23] ring-1 ring-[#154b23] text-[#154b23]' : 'border-gray-200 text-gray-900'}
                    focus:border-[#154b23] focus:ring-1 focus:ring-[#154b23]`}
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              isLoading={loading}
              className="w-full py-3 mt-2 min-h-[44px]"
              icon={<ArrowLeft size={18} />}
            >
              تأكيد الكود
            </Button>

            <div className="text-center mt-6 space-y-3">
              <p className="text-sm md:text-base text-gray-600">
                لم يصلك الكود؟{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[#154b23] font-bold hover:underline disabled:opacity-50 cursor-pointer min-h-[44px] inline-flex items-center"
                >
                  {resendLoading ? 'جاري الإرسال...' : 'إعادة الإرسال'}
                </button>
              </p>
              <Link to="/forgot-password" className="text-sm text-gray-500 hover:underline block">
                تغيير البريد الإلكتروني
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}