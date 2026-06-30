import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [broadcast, setBroadcast] = useState({ title: '', body: '', governorate: '', type: 'general' });
  const [sending, setSending] = useState(false);

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
    if (!broadcast.title || !broadcast.body) {
      toast.error('العنوان والمحتوى مطلوبان');
      return;
    }
    setSending(true);
    try {
      const res = await adminService.broadcastNotification({
        title: broadcast.title,
        body: broadcast.body,
        governorate: broadcast.governorate || undefined,
        type: broadcast.type,
      });
      toast.success(res.data.message || 'تم الإرسال');
      setBroadcast({ title: '', body: '', governorate: '', type: 'general' });
      fetchNotifications();
    } catch {
      toast.error('فشل إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { key: 'user', label: 'المستخدم', render: (r) => r.user_id?.name || '—' },
    { key: 'title', label: 'العنوان' },
    { key: 'type', label: 'النوع' },
    { key: 'read', label: 'مقروء', render: (r) => (r.is_read ? 'نعم' : 'لا') },
    { key: 'date', label: 'التاريخ', render: (r) => new Date(r.created_at).toLocaleDateString('ar-EG') },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-stone-800">الإشعارات</h2>

      <form onSubmit={handleBroadcast} className="bg-white rounded-2xl p-5 border border-stone-100 space-y-4">
        <h3 className="font-bold text-stone-700">إرسال إشعار جماعي</h3>
        <input
          required
          placeholder="عنوان الإشعار"
          value={broadcast.title}
          onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          required
          rows={3}
          placeholder="محتوى الإشعار"
          value={broadcast.body}
          onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={broadcast.governorate}
            onChange={(e) => setBroadcast({ ...broadcast, governorate: e.target.value })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="">كل المحافظات</option>
            {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={broadcast.type}
            onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="general">عام</option>
            <option value="outbreak_alert">تنبيه فاشية</option>
            <option value="vaccination_reminder">تذكير تطعيم</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="px-6 py-2 bg-[#2d5a1b] text-white rounded-xl font-bold disabled:opacity-50"
        >
          {sending ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </form>

      <div>
        <h3 className="font-bold text-stone-700 mb-3">سجل الإشعارات</h3>
        <DataTable columns={columns} data={notifications} loading={loading} pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
