import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';
import {
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  adminInputClass,
  adminSelectClass,
  adminLabelClass,
} from '../../components/admin/AdminUI';

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
      <span className="px-2.5 py-1 bg-stone-50 text-stone-600 rounded-full text-[10px] font-black uppercase tracking-wide border border-stone-200">
        {r.type === 'outbreak_alert' ? 'تحذير وباء' : r.type === 'admin_broadcast' ? 'إعلان إداري' : 'نظام'}
      </span>
    )},
    { key: 'body', label: 'المحتوى', className: 'whitespace-normal leading-relaxed text-xs min-w-[200px]', render: (r) => <span className="text-stone-500">{r.body}</span> },
    { key: 'users_count', label: 'مستلمين', render: (r) => <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black border border-indigo-100">{r.users_count} مستخدم</span> },
    { key: 'date', label: 'التاريخ', render: (r) => <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleString('ar-EG')}</span> },
  ];

  const fieldClass = `${adminInputClass} hover:shadow-sm`;

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="إدارة الإشعارات"
        subtitle="إرسال إشعارات عامة وتنبيهات لمزارعي المنصة."
        action={
          <AdminPrimaryButton active={showForm} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'إلغاء' : '📢 إرسال إشعار جديد'}
          </AdminPrimaryButton>
        }
      />

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] p-6 mb-6">
          <h3 className="text-base font-black text-stone-800 mb-4">تفاصيل الإشعار الجديد</h3>
          <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass}>العنوان *</label>
              <input required placeholder="عنوان الإشعار..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass}>نص الإشعار *</label>
              <textarea required rows={3} placeholder="تفاصيل الإشعار الذي سيصل للمستخدمين..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={`${fieldClass} resize-none`} />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass}>استهداف محافظة (اختياري)</label>
              <select value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })} className={adminSelectClass}>
                <option value="">الجميع (כל المحافظات)</option>
                {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass}>استهداف دور معين (اختياري)</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={adminSelectClass}>
                <option value="">الجميع</option>
                <option value="user">مزارع</option>
                <option value="sub_admin">مدير</option>
                <option value="admin">مدير النظام</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button disabled={broadcasting} type="submit" className="px-8 py-3 bg-gradient-to-l from-[#1b4d2c] to-[#2a5c2a] hover:brightness-105 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50">
                {broadcasting ? 'جاري الإرسال...' : 'إرسال الإشعار'}
              </button>
            </div>
          </form>
        </div>
      )}

      <AdminPanel>
        <DataTable columns={columns} data={notifications} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
