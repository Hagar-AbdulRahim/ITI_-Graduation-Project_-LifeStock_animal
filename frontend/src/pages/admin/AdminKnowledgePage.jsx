import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';

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
    <div className="space-y-6 relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">إدارة قاعدة المعرفة</h2>
          <p className="text-sm text-stone-500 font-medium">إعادة بناء الـ RAG وقياس عدد الـ chunks المخزنة.</p>
        </div>
        <Button onClick={handleRebuild} className="w-auto px-6" disabled={rebuilding}>
          {rebuilding ? 'جارٍ إعادة البناء...' : 'إعادة بناء الـ RAG'}
        </Button>
      </div>

      <div className="bg-white/80 rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
            <p className="text-sm text-stone-500">عدد الـ chunks المخزنة</p>
            <p className="text-3xl font-black text-[#2a5c2a] mt-2">{loading ? '...' : stats?.chunks_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
            <p className="text-sm text-stone-500">الحالة</p>
            <p className="text-lg font-bold text-stone-700 mt-2">جاهز للاستخدام في الذكاء الاصطناعي</p>
          </div>
        </div>
      </div>
    </div>
  );
}
