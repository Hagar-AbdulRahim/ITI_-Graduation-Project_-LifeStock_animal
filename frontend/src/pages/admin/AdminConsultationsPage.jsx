import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';
import { AdminPageHeader, AdminPanel, AdminFilterBar, AdminSelect } from '../../components/admin/AdminUI';

export default function AdminConsultationsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [governorate, setGovernorate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getConsultations({ page, limit: 15, governorate: governorate || undefined });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الاستشارات');
    } finally {
      setLoading(false);
    }
  }, [page, governorate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'user', label: 'المستخدم', render: (r) => <span className="font-bold text-stone-800">{r.user_id?.name || '—'}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'diagnosis', label: 'التشخيص', className: 'whitespace-normal leading-relaxed text-xs min-w-[150px]', render: (r) => <span className="text-stone-700 font-bold">{r.ai_diagnosis || '—'}</span> },
    { key: 'symptoms', label: 'الأعراض', className: 'whitespace-normal leading-relaxed text-xs min-w-[150px]', render: (r) => <span className="text-stone-500 text-xs">{r.symptoms?.join('، ') || '—'}</span> },
    { key: 'treatment', label: 'العلاج المقترح', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => {
      const treatment = r.ai_raw_response?.treatment?.summary || r.ai_raw_response?.disease_info || '—';
      const meds = r.ai_raw_response?.treatment?.medications || r.ai_raw_response?.treatment?.medicines || [];
      const medsNames = meds.map(m => typeof m === 'object' ? (m.name || m.medicine_name || '') : m).filter(Boolean);
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[#2a5c2a] font-medium">{treatment}</span>
          {medsNames.length > 0 && <span className="text-stone-500 mt-1 font-bold">الأدوية: {medsNames.join('، ')}</span>}
        </div>
      );
    }},
    { key: 'vaccines', label: 'اللقاحات', className: 'whitespace-normal leading-relaxed text-xs min-w-[150px]', render: (r) => {
      const vaccines = r.ai_raw_response?.suggested_vaccines || [];
      const vacNames = vaccines.map(v => typeof v === 'object' ? (v.vaccine_name || v.name || '') : v).filter(Boolean);
      return vacNames.length > 0 ? (
        <span className="text-blue-600 font-bold">{vacNames.join('، ')}</span>
      ) : <span className="text-stone-400">—</span>;
    }},
    { key: 'prevention', label: 'طرق الوقاية', className: 'whitespace-normal leading-relaxed text-xs min-w-[200px]', render: (r) => {
       const prevention = r.ai_raw_response?.prevention_tips?.join('، ') || r.ai_raw_response?.prevention || r.suggested_actions?.join('، ') || '—';
       return <span className="text-stone-500">{prevention}</span>;
    }},
    { key: 'severity', label: 'الخطورة', render: (r) => {
      const severityMap = { red: 'خطير', yellow: 'متوسط', green: 'مستقر' };
      const colorMap = { red: 'text-red-600 bg-red-50 border-red-200', yellow: 'text-amber-600 bg-amber-50 border-amber-200', green: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      const styles = colorMap[r.severity] || 'text-stone-500 bg-stone-50 border-stone-200';
      return <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${styles}`}>{severityMap[r.severity] || r.severity || '—'}</span>;
    }},
    { key: 'date', label: 'التاريخ', render: (r) => <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString('ar-EG')}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="الاستشارات العامة"
        subtitle="متابعة استشارات المزارعين الموجهة للأطباء البيطريين عبر المنصة."
      />
      <AdminPanel>
        <AdminFilterBar>
          <AdminSelect
            label="تصفية بالمحافظة"
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
          >
            <option value="">كل المحافظات</option>
            {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </AdminSelect>
        </AdminFilterBar>
        <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
