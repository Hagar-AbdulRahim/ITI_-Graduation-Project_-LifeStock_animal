import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import doctorService from '../../services/doctorService';
import DataTable from '../../components/admin/DataTable';

export default function DoctorOutbreaksPage() {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorService.getOutbreaks({ status: 'active' });
      setOutbreaks(res.data.data || []);
    } catch {
      toast.error('فشل تحميل الفاشيات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOutbreaks(); }, [fetchOutbreaks]);

  const columns = [
    { key: 'disease_name', label: 'المرض' },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'cases_count', label: 'عدد الحالات' },
    { key: 'message', label: 'التحذير', render: (r) => r.ai_warning_message?.slice(0, 50) || '—' },
    { key: 'date', label: 'التاريخ', render: (r) => new Date(r.detected_at).toLocaleDateString('ar-EG') },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">الفاشيات النشطة</h2>
      <p className="text-sm text-stone-500">فاشيات في المحافظات المخصصة لك</p>
      <DataTable columns={columns} data={outbreaks} loading={loading} />
    </div>
  );
}
