import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import doctorService from '../../services/doctorService';
import DataTable from '../../components/admin/DataTable';
import { SEVERITY_LABELS } from '../../constant/adminData';

export default function DoctorCasesPage() {
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('open');
  const [reviewId, setReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ vet_notes: '', severity: 'yellow', recommended_treatment: '' });

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorService.getHealthCases({ page, limit: 15, status: status || undefined });
      setCases(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الحالات');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await doctorService.reviewHealthCase(reviewId, reviewForm);
      toast.success('تمت مراجعة الحالة');
      setReviewId(null);
      fetchCases();
    } catch {
      toast.error('فشل المراجعة');
    }
  };

  const columns = [
    { key: 'animal', label: 'الحيوان', render: (r) => r.animal_id?.tag_number || '—' },
    { key: 'user', label: 'المزارع', render: (r) => r.user_id?.name || '—' },
    { key: 'diagnosis', label: 'التشخيص', render: (r) => r.ai_diagnosis?.slice(0, 40) || '—' },
    { key: 'severity', label: 'الخطورة', render: (r) => SEVERITY_LABELS[r.severity] || r.severity },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'status', label: 'الحالة', render: (r) => (r.resolved ? 'مغلقة' : 'مفتوحة') },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => !r.resolved && (
        <button type="button" onClick={() => { setReviewId(r._id); setReviewForm({ vet_notes: r.vet_notes || '', severity: r.severity || 'yellow', recommended_treatment: r.recommended_treatment || '' }); }} className="text-[#2d5a1b] text-xs font-bold">
          مراجعة
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">الحالات الصحية</h2>

      {reviewId && (
        <form onSubmit={handleReview} className="bg-white rounded-2xl p-5 border border-stone-100 space-y-3">
          <h3 className="font-bold text-stone-700">مراجعة الحالة</h3>
          <textarea
            rows={3}
            placeholder="ملاحظات الطبيب"
            value={reviewForm.vet_notes}
            onChange={(e) => setReviewForm({ ...reviewForm, vet_notes: e.target.value })}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <select
            value={reviewForm.severity}
            onChange={(e) => setReviewForm({ ...reviewForm, severity: e.target.value })}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="green">منخفض</option>
            <option value="yellow">متوسط</option>
            <option value="red">عالي</option>
          </select>
          <input
            placeholder="العلاج الموصى به"
            value={reviewForm.recommended_treatment}
            onChange={(e) => setReviewForm({ ...reviewForm, recommended_treatment: e.target.value })}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#2d5a1b] text-white rounded-xl text-sm font-bold">حفظ</button>
            <button type="button" onClick={() => setReviewId(null)} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-stone-200 rounded-xl px-3 py-2 text-sm">
        <option value="">الكل</option>
        <option value="open">مفتوحة</option>
        <option value="resolved">مغلقة</option>
      </select>

      <DataTable columns={columns} data={cases} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
