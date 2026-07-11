import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import {
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminGovernorateDropdown,
  adminInputClass,
  adminSelectClass,
  adminLabelClass,
} from '../../components/admin/AdminUI';

const fieldClass = adminInputClass;

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', governorate: '', role: '' });
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getNotifications({ page, limit: 15 });
      setNotifications(res.data.data);
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
    if (!form.title || !form.body) {
      toast.error('العنوان والمحتوى مطلوبان');
      return;
    }
    setBroadcasting(true);
    try {
      const res = await adminService.broadcastNotification({
        title: form.title,
        body: form.body,
        governorate: form.governorate || undefined,
        role: form.role || undefined,
      });
      toast.success(res.data.message || 'تم الإرسال');
      setForm({ title: '', body: '', governorate: '', role: '' });
      setShowForm(false);
      fetchNotifications();
    } catch {
      toast.error('فشل إرسال الإشعار');
    } finally {
      setBroadcasting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'العنوان',
      render: (r) => <span className="font-bold text-stone-800 text-sm">{r.title}</span>,
    },
    {
      key: 'type',
      label: 'النوع',
      render: (r) => {
        const typeMap = {
          outbreak_alert: { label: 'تحذير وباء', cls: 'bg-red-50 text-red-600 border-red-200' },
          admin_broadcast: { label: 'إعلان إداري', cls: 'bg-[#f0f8f2] text-[#1b4d2c] border-[#2a5c2a]/20' },
        };
        const t = typeMap[r.type] || { label: 'نظام', cls: 'bg-stone-50 text-stone-600 border-stone-200' };
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${t.cls}`}>
            {t.label}
          </span>
        );
      },
    },
    {
      key: 'body',
      label: 'المحتوى',
      className: 'whitespace-normal leading-relaxed text-xs min-w-[200px]',
      render: (r) => <span className="text-stone-500 text-xs">{r.body}</span>,
    },
    {
      key: 'users_count',
      label: 'المستلمون',
      render: (r) => (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black border border-indigo-100">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          {r.users_count} مستخدم
        </span>
      ),
    },
    {
      key: 'date',
      label: 'التاريخ',
      render: (r) => (
        <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap">
          {new Date(r.created_at).toLocaleString('ar-EG')}
        </span>
      ),
    },
  ];

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="إدارة الإشعارات"
        subtitle="إرسال إشعارات عامة وتنبيهات لمزارعي المنصة."
        action={
          <AdminPrimaryButton active={showForm} onClick={() => setShowForm(!showForm)}>
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              {showForm ? 'إلغاء' : 'إرسال إشعار جديد'}
            </span>
          </AdminPrimaryButton>
        }
      />

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_4px_28px_-4px_rgba(27,77,44,0.12)] p-6 mb-6 admin-slide-up">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b4d2c] to-[#2a5c2a] flex items-center justify-center shadow-sm">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-800">إنشاء إشعار جديد</h3>
              <p className="text-[11px] text-stone-400 font-medium">سيُرسل الإشعار للمجموعة المستهدفة فوراً</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className={adminLabelClass}>عنوان الإشعار *</label>
              <input
                required
                placeholder="أدخل عنواناً واضحاً ومختصراً..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={adminLabelClass}>نص الإشعار *</label>
              <textarea
                required
                rows={3}
                placeholder="تفاصيل الإشعار الذي سيصل للمستخدمين..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className={`${fieldClass} resize-none`}
              />
            </div>
            <div className="space-y-1.5">
              <AdminGovernorateDropdown
                label="استهداف محافظة (اختياري)"
                value={form.governorate}
                onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                allLabel="الجميع (كل المحافظات)"
              />
            </div>
            <div className="space-y-1.5">
              <label className={adminLabelClass}>استهداف دور معين (اختياري)</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={adminSelectClass}
                >
                  <option value="">الجميع</option>
                  <option value="user">مزارع</option>
                  <option value="sub_admin">مدير</option>
                  <option value="admin">مدير النظام</option>
                </select>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                disabled={broadcasting}
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-l from-[#1b4d2c] to-[#2a5c2a] hover:brightness-105 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {broadcasting ? 'جاري الإرسال...' : 'إرسال الإشعار'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 className="font-bold text-stone-700 mb-3">سجل الإشعارات</h3>
        <DataTable columns={columns} data={notifications} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}