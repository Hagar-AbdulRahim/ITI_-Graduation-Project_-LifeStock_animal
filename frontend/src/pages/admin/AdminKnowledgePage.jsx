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
            <span className="flex items-center gap-2">
              {rebuilding ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  جارٍ إعادة البناء...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  إعادة بناء الـ RAG
                </>
              )}
            </span>
          </Button>
        }
      />
      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chunks Count */}
          <div className="relative overflow-hidden rounded-2xl border border-[#2a5c2a]/20 bg-gradient-to-br from-[#f0f8f2] to-white p-6 hover:border-[#1b4d2c]/30 hover:shadow-[0_4px_20px_-4px_rgba(27,77,44,0.15)] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1b4d2c]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="px-2.5 py-1 bg-[#1b4d2c]/8 text-[#1b4d2c] rounded-full text-[10px] font-black uppercase tracking-wide">
                RAG
              </span>
            </div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">عدد الـ chunks المخزنة</p>
            <p className="text-4xl font-black text-[#1b4d2c] leading-none">
              {loading ? (
                <span className="inline-block w-16 h-10 bg-stone-200 rounded-xl animate-pulse" />
              ) : (
                stats?.chunks_count ?? 0
              )}
            </p>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#1b4d2c]/5 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 hover:border-[#2a5c2a]/25 hover:shadow-[0_4px_20px_-4px_rgba(27,77,44,0.10)] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                نشط
              </span>
            </div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">حالة النظام</p>
            <p className="text-base font-bold text-stone-700">جاهز للاستخدام في الذكاء الاصطناعي</p>
            <p className="text-xs text-stone-400 font-medium mt-1">يعمل بكفاءة كاملة</p>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-50/60 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
