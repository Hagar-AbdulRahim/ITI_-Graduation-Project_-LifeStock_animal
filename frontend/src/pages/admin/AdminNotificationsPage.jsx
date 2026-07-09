import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { EGYPTIAN_GOVERNORATES, ROLE_LABELS } from '../../constant/adminData';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', governorate: '', role: '' });
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getNotifications({ page, limit: 15 });
      setNotifications(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const res = await adminService.broadcastNotification(form);
      toast.success(res.data.message || 'تم إرسال الإشعار بنجاح');
      setShowForm(false);
      setForm({ title: '', body: '', governorate: '', role: '' });
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إرسال الإشعار');
    } finally {
      setBroadcasting(false);
    }
  };

  const columns = [
    { key: 'title', label: 'العنوان', render: (r) => <span className="font-bold text-stone-800">{r.title}</span> },
    { key: 'type', label: 'النوع', render: (r) => (
      <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold">
        {r.type === 'outbreak_alert' ? 'تحذير وباء' : r.type === 'admin_broadcast' ? 'إعلان إداري' : 'نظام'}
      </span>
    )},
    { key: 'body', label: 'المحتوى', className: 'whitespace-normal leading-relaxed text-xs min-w-[200px]', render: (r) => <span className="text-stone-500">{r.body}</span> },
    { key: 'users_count', label: 'مستلمين', render: (r) => <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-black">{r.users_count} مستخدم</span> },
    { key: 'date', label: 'التاريخ', render: (r) => <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleString('ar-EG')}</span> },
  ];

  return (
    <div className="space-y-6 relative z-10" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">إدارة الإشعارات</h2>
          <p className="text-sm text-stone-500 font-medium">إرسال إشعارات عامة وتنبيهات لمزارعي المنصة.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all ${
            showForm ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-gradient-to-l from-indigo-600 to-blue-500 text-white hover:shadow-lg'
          }`}
        >
          {showForm ? 'إلغاء' : '📢 إرسال إشعار جديد'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_20px_40px_rgb(0,0,0,0.08)] animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-stone-800 mb-4">تفاصيل الإشعار الجديد</h3>
          <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-stone-500">العنوان *</label>
              <input
                required
                placeholder="عنوان الإشعار..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all placeholder:text-stone-400"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-stone-500">نص الإشعار *</label>
              <textarea
                required
                rows={3}
                placeholder="تفاصيل الإشعار الذي سيصل للمستخدمين..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all placeholder:text-stone-400 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">استهداف محافظة (اختياري)</label>
              <select
                value={form.governorate}
                onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none cursor-pointer text-stone-700"
              >
                <option value="">الجميع (כל المحافظات)</option>
                {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">استهداف دور معين (اختياري)</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-3 text-sm outline-none cursor-pointer text-stone-700"
              >
                <option value="">الجميع</option>
                <option value="user">مزارع</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button disabled={broadcasting} type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                {broadcasting ? 'جاري الإرسال...' : 'إرسال الإشعار'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="overflow-hidden rounded-2xl border border-stone-100/80 bg-white/50">
          <DataTable columns={columns} data={notifications} loading={loading} pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
