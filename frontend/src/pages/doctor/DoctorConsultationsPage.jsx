import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import doctorService from '../../services/doctorService';
import DataTable from '../../components/admin/DataTable';

export default function DoctorConsultationsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [respondId, setRespondId] = useState(null);
  const [response, setResponse] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorService.getConsultations({ page, limit: 15 });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الاستشارات');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!response.trim()) {
      toast.error('الرد مطلوب');
      return;
    }
    try {
      await doctorService.respondConsultation(respondId, { doctor_response: response });
      toast.success('تم إرسال الرد');
      setRespondId(null);
      setResponse('');
      fetchData();
    } catch {
      toast.error('فشل إرسال الرد');
    }
  };

  const columns = [
    { key: 'user', label: 'المستخدم', render: (r) => r.user_id?.name || '—' },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'question', label: 'الأعراض', render: (r) => (Array.isArray(r.symptoms) ? r.symptoms.join('، ') : r.symptoms)?.slice(0, 50) || '—' },
    { key: 'diagnosis', label: 'تشخيص AI', render: (r) => r.ai_diagnosis?.slice(0, 40) || '—' },
    { key: 'date', label: 'التاريخ', render: (r) => new Date(r.created_at).toLocaleDateString('ar-EG') },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => r.doctor_status !== 'responded' && (
        <button type="button" onClick={() => { setRespondId(r._id); setResponse(''); }} className="text-[#2d5a1b] text-xs font-bold">
          رد
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">الاستشارات المعلقة</h2>

      {respondId && (
        <form onSubmit={handleRespond} className="bg-white rounded-2xl p-5 border border-stone-100 space-y-3">
          <h3 className="font-bold text-stone-700">الرد على الاستشارة</h3>
          <textarea
            required
            rows={4}
            placeholder="اكتب ردك الطبي..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#2d5a1b] text-white rounded-xl text-sm font-bold">إرسال</button>
            <button type="button" onClick={() => setRespondId(null)} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
