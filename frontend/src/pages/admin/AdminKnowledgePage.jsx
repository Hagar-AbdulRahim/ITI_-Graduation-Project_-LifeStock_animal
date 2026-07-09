import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import { AdminPageHeader, AdminPanel } from '../../components/admin/AdminUI';

export default function AdminKnowledgePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);

  const loadStats = async () => {
    try {
      const res = await adminService.getKnowledgeBaseStats();
      setStats(res.data?.data || null);
    } catch {
      toast.error('فشل تحميل إحصائيات قاعدة المعرفة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      const res = await adminService.rebuildKnowledgeBase();
      toast.success(res.data?.message || 'تم إعادة بناء قاعدة المعرفة');
      await loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إعادة البناء');
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="إدارة قاعدة المعرفة"
        subtitle="إعادة بناء الـ RAG وقياس عدد الـ chunks المخزنة."
        action={
          <Button onClick={handleRebuild} className="w-auto px-6" disabled={rebuilding}>
            {rebuilding ? 'جارٍ إعادة البناء...' : 'إعادة بناء الـ RAG'}
          </Button>
        }
      />
      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-stone-200 bg-[#f6fbf4] p-5 hover:border-[#2a5c2a]/30 transition-colors">
            <p className="text-sm text-stone-500 font-medium">عدد الـ chunks المخزنة</p>
            <p className="text-3xl font-black text-[#1b4d2c] mt-2">{loading ? '...' : stats?.chunks_count ?? 0}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5 hover:border-[#2a5c2a]/30 transition-colors">
            <p className="text-sm text-stone-500 font-medium">الحالة</p>
            <p className="text-lg font-bold text-stone-700 mt-2">جاهز للاستخدام في الذكاء الاصطناعي</p>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
