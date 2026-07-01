import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';

export default function AdminOutbreaksPage() {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    disease_name: '',
    governorate: EGYPTIAN_GOVERNORATES[0],
    cases_count: 1,
    ai_warning_message: '',
  });

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getOutbreaks({ status: status || undefined });
      setOutbreaks(res.data.data || []);
    } catch {
      toast.error('فشل تحميل تقارير الفاشيات');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchOutbreaks(); }, [fetchOutbreaks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.createOutbreak(form);
      toast.success('تم إنشاء تقرير الفاشية');
      setShowForm(false);
      setForm({ disease_name: '', governorate: EGYPTIAN_GOVERNORATES[0], cases_count: 1, ai_warning_message: '' });
      fetchOutbreaks();
    } catch {
      toast.error('فشل إنشاء التقرير');
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminService.resolveOutbreak(id);
      toast.success('تم حل الفاشية');
      fetchOutbreaks();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const columns = [
    { key: 'disease_name', label: 'المرض', render: (r) => <span className="font-bold text-stone-800">{r.disease_name}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'cases_count', label: 'عدد الحالات', render: (r) => <span className="font-bold text-red-500">{r.cases_count}</span> },
    { key: 'status', label: 'الحالة', render: (r) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${r.status === 'active' ? 'bg-red-50 text-red-600 border border-red-200/50' : 'bg-green-50 text-[#2a5c2a] border border-green-200/50'}`}>
        {r.status === 'active' ? 'نشطة' : 'محلولة'}
      </span>
    ) },
    { key: 'date', label: 'التاريخ', render: (r) => <span className="text-xs text-stone-500">{new Date(r.detected_at).toLocaleDateString('ar-EG')}</span> },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => r.status === 'active' && (
        <button type="button" onClick={() => handleResolve(r._id)} className="px-3 py-1 bg-green-50 text-[#2a5c2a] rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
          اعتبارها محلولة
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">إدارة الفاشيات</h2>
          <p className="text-sm text-stone-500 font-medium">مراقبة الفاشيات والأمراض المعدية وإصدار التحذيرات.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all ${
            showForm ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-gradient-to-l from-[#2a5c2a] to-[#3d8c40] text-white'
          }`}
        >
          {showForm ? 'إلغاء' : '+ تسجيل فاشية جديدة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_20px_40px_rgb(0,0,0,0.08)] animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-stone-800 mb-4">تفاصيل الفاشية الجديدة</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">اسم المرض *</label>
              <input
                required
                placeholder="مثال: الحمى القلاعية"
                value={form.disease_name}
                onChange={(e) => setForm({ ...form, disease_name: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400/30 transition-all placeholder:text-stone-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">المحافظة *</label>
              <select
                value={form.governorate}
                onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400/30 transition-all cursor-pointer text-stone-700"
              >
                {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">عدد الحالات المكتشفة *</label>
              <input
                type="number"
                min={1}
                value={form.cases_count}
                onChange={(e) => setForm({ ...form, cases_count: Number(e.target.value) })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400/30 transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-stone-500">رسالة التحذير (اختياري)</label>
              <input
                placeholder="توجيهات للمزارعين بشأن التعامل مع الفاشية..."
                value={form.ai_warning_message}
                onChange={(e) => setForm({ ...form, ai_warning_message: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400/30 transition-all placeholder:text-stone-400"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                تأكيد ونشر التحذير
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-stone-600">تصفية حسب الحالة:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 transition-all cursor-pointer">
              <option value="">الكل</option>
              <option value="active">نشطة</option>
              <option value="resolved">محلولة</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-100/80 bg-white/50">
          <DataTable columns={columns} data={outbreaks} loading={loading} />
        </div>
      </div>
    </div>
  );
}
