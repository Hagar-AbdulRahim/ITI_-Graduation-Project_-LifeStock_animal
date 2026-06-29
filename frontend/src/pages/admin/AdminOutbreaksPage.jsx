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
    { key: 'disease_name', label: 'المرض' },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'cases_count', label: 'عدد الحالات' },
    { key: 'status', label: 'الحالة', render: (r) => (r.status === 'active' ? 'نشطة' : 'محلولة') },
    { key: 'date', label: 'التاريخ', render: (r) => new Date(r.detected_at).toLocaleDateString('ar-EG') },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => r.status === 'active' && (
        <button type="button" onClick={() => handleResolve(r._id)} className="text-[#2d5a1b] text-xs font-bold">
          حل
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-stone-800">تقارير الفاشيات</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#2d5a1b] text-white text-sm font-bold rounded-xl hover:bg-[#3d6b47]"
        >
          {showForm ? 'إلغاء' : 'تقرير جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-5 border border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            placeholder="اسم المرض"
            value={form.disease_name}
            onChange={(e) => setForm({ ...form, disease_name: e.target.value })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <select
            value={form.governorate}
            onChange={(e) => setForm({ ...form, governorate: e.target.value })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          >
            {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input
            type="number"
            min={1}
            value={form.cases_count}
            onChange={(e) => setForm({ ...form, cases_count: Number(e.target.value) })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <input
            placeholder="رسالة التحذير (اختياري)"
            value={form.ai_warning_message}
            onChange={(e) => setForm({ ...form, ai_warning_message: e.target.value })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm md:col-span-2"
          />
          <button type="submit" className="md:col-span-2 py-2 bg-[#2d5a1b] text-white rounded-xl font-bold">
            حفظ التقرير
          </button>
        </form>
      )}

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-stone-200 rounded-xl px-3 py-2 text-sm">
        <option value="">الكل</option>
        <option value="active">نشطة</option>
        <option value="resolved">محلولة</option>
      </select>

      <DataTable columns={columns} data={outbreaks} loading={loading} />
    </div>
  );
}
