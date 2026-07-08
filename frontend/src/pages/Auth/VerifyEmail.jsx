import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import api from '../../services/api';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setResending(true);
    setResendMessage('');
    try {
      const res = await api.post('/api/auth/resend-verification', { email });
      setResendMessage(res.data.message || 'تم إرسال الرابط بنجاح');
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'فشل إرسال الرابط');
    } finally {
      setResending(false);
    }
  };
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('رابط التحقق غير صحيح أو منتهي الصلاحية');
      return;
    }

    api.get(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage('تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
        
        // Auto-redirect after 3 seconds
        setTimeout(() => navigate('/login'), 3000);

        // Auto-redirect after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.response?.data?.message || 'فشل تفعيل الحساب. الرابط غير صحيح أو منتهي الصلاحية.');
      });
  }, []);

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
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-right">تفعيل الحساب</h3>
            <p className="text-base lg:text-lg text-white/90 leading-relaxed text-right">
              نقوم بالتحقق من بريدك الإلكتروني لتفعيل حسابك وضمان الأمان.
            </p>
          </div>
          <p className="text-xs text-white/70">© 2024 رعاية. مستدام.</p>
        </div>
      </div>

      {/* Left Side - Status */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 bg-[#fbf9f6]">
        <div className="w-full max-w-md text-center">

          {/* Loading */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-[#154b23]/10 rounded-full">
                <Loader size={32} className="text-[#154b23] animate-spin md:hidden" />
                <Loader size={36} className="text-[#154b23] animate-spin hidden md:block" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">جاري تفعيل الحساب...</h1>
              <p className="text-sm md:text-base text-gray-500">يرجى الانتظار لحظة</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full">
                <CheckCircle size={36} className="text-green-600 md:hidden" />
                <CheckCircle size={40} className="text-green-600 hidden md:block" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">تم التفعيل بنجاح! 🎉</h1>
              <p className="text-sm md:text-base text-gray-600">{message}</p>
              <p className="text-xs text-gray-400">سيتم تحويلك لصفحة تسجيل الدخول خلال ثوانٍ...</p>
              <Link
                to="/login"
                className="mt-2 w-full flex items-center justify-center rounded-lg py-3 px-8 font-bold bg-[#154b23] text-white hover:bg-[#0f3619] transition-colors min-h-[44px]"
              >
                تسجيل الدخول الآن
              </Link>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full">
                <XCircle size={36} className="text-red-500 md:hidden" />
                <XCircle size={40} className="text-red-500 hidden md:block" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">فشل التفعيل</h1>
              <p className="text-sm md:text-base text-gray-600">{message}</p>
              <div className="flex flex-col gap-3 mt-4 w-full">
                <form onSubmit={handleResend} className="flex flex-col gap-2 w-full">
                  <p className="text-sm text-gray-700 font-medium mb-1">أدخل بريدك الإلكتروني لإرسال رابط جديد:</p>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#154b23] focus:border-transparent text-right"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full flex items-center justify-center rounded-lg py-3 px-4 font-bold bg-[#154b23] text-white hover:bg-[#0f3619] transition-colors disabled:opacity-70"
                  >
                    {resending ? 'جاري الإرسال...' : 'إرسال رابط تفعيل جديد'}
                  </button>
                </form>
                
                {resendMessage && (
                  <p className={`text-sm mt-2 ${resendMessage.includes('فشل') ? 'text-red-500' : 'text-green-600'}`}>
                    {resendMessage}
                  </p>
                )}

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#fbf9f6] text-gray-500">أو</span></div>
                </div>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center rounded-lg py-3 px-4 font-bold border-2 border-[#154b23] text-[#154b23] hover:bg-[#154b23] hover:text-white transition-colors"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}