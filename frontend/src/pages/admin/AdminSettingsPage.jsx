import { useSelector } from 'react-redux';
import { ROLE_LABELS } from '../../constant/adminData';

export default function AdminSettingsPage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black text-stone-800">إعدادات النظام</h2>

      <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
        <h3 className="font-bold text-stone-700">حساب المدير</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400 mb-1">الاسم</p>
            <p className="font-semibold text-stone-800">{user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-stone-400 mb-1">البريد</p>
            <p className="font-semibold text-stone-800">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-stone-400 mb-1">الدور</p>
            <p className="font-semibold text-stone-800">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <div>
            <p className="text-stone-400 mb-1">المحافظة</p>
            <p className="font-semibold text-stone-800">{user?.governorate || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-3">
        <h3 className="font-bold text-stone-700">معلومات التطبيق</h3>
        <div className="text-sm text-stone-600 space-y-2">
          <p><span className="text-stone-400">الإصدار:</span> 1.0.0</p>
          <p><span className="text-stone-400">البيئة:</span> {import.meta.env.MODE}</p>
          <p><span className="text-stone-400">API:</span> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}</p>
        </div>
      </div>

      <div className="bg-[#eaf3e8] rounded-2xl p-5 border border-[#2d5a1b]/20 text-sm text-[#2d5a1b]">
        <p className="font-bold mb-1">للاختبار</p>
        <p>استخدم مجموعة Postman في مجلد <code className="bg-white/60 px-1 rounded">postman/</code> لاختبار جميع نقاط النهاية.</p>
        <p className="mt-2">لإنشاء حساب مدير: <code className="bg-white/60 px-1 rounded">npm run seed:admin</code> في مجلد backend</p>
      </div>
    </div>
  );
}
