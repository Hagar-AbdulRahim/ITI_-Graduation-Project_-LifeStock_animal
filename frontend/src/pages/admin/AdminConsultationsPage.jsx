import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';
import { AdminPageHeader, AdminPanel, AdminFilterBar, AdminGovernorateDropdown } from '../../components/admin/AdminUI';

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
    {
      key: 'user',
      label: 'المستخدم',
      render: (r) => (
        <div>
          <span className="font-bold text-stone-800 text-sm block">{r.user_id?.name || '—'}</span>
          <span className="text-[11px] text-stone-400 font-medium">{r.governorate}</span>
        </div>
      ),
    },
    {
      key: 'diagnosis',
      label: 'التشخيص',
      className: 'whitespace-normal leading-relaxed text-xs min-w-[150px]',
      render: (r) => (
        <span className="text-stone-700 font-bold text-sm">{r.ai_diagnosis || '—'}</span>
      ),
    },
    {
      key: 'symptoms',
      label: 'الأعراض',
      className: 'whitespace-normal leading-relaxed text-xs min-w-[150px]',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.symptoms?.length > 0 ? r.symptoms.map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
              {s}
            </span>
          )) : <span className="text-stone-400 text-xs">—</span>}
        </div>
      ),
    },
    {
      key: 'treatment',
      label: 'العلاج المقترح',
      className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]',
      render: (r) => {
        const treatment = r.ai_raw_response?.treatment?.summary || r.ai_raw_response?.disease_info || '—';
        const meds = r.ai_raw_response?.treatment?.medications || r.ai_raw_response?.treatment?.medicines || [];
        const medsNames = meds.map(m => typeof m === 'object' ? (m.name || m.medicine_name || '') : m).filter(Boolean);
        return (
          <div className="flex flex-col gap-1.5">
            <span className="text-[#1b4d2c] font-medium text-xs">{treatment}</span>
            {medsNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {medsNames.map((med, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#f0f8f2] text-[#1b4d2c] border border-[#2a5c2a]/20 rounded-md text-[10px] font-bold">
                    {med}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'vaccines',
      label: 'اللقاحات',
      className: 'whitespace-normal leading-relaxed text-xs min-w-[150px]',
      render: (r) => {
        const vaccines = r.ai_raw_response?.suggested_vaccines || [];
        const vacNames = vaccines.map(v => typeof v === 'object' ? (v.vaccine_name || v.name || '') : v).filter(Boolean);
        return vacNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {vacNames.map((v, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                💉 {v}
              </span>
            ))}
          </div>
        ) : <span className="text-stone-400 text-xs">—</span>;
      },
    },
    {
      key: 'prevention',
      label: 'طرق الوقاية',
      className: 'whitespace-normal leading-relaxed text-xs min-w-[200px]',
      render: (r) => {
        const prevention = r.ai_raw_response?.prevention_tips?.join('، ') || r.ai_raw_response?.prevention || r.suggested_actions?.join('، ') || '—';
        return <span className="text-stone-500 text-xs">{prevention}</span>;
      },
    },
    {
      key: 'severity',
      label: 'الخطورة',
      render: (r) => {
        const severityMap = { red: 'خطير', yellow: 'متوسط', green: 'مستقر' };
        const colorMap = {
          red: 'text-red-600 bg-red-50 border-red-200',
          yellow: 'text-amber-600 bg-amber-50 border-amber-200',
          green: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
        const styles = colorMap[r.severity] || 'text-stone-500 bg-stone-50 border-stone-200';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${styles}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${r.severity === 'red' ? 'bg-red-400 animate-pulse' : r.severity === 'yellow' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {severityMap[r.severity] || r.severity || '—'}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'التاريخ',
      render: (r) => (
        <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap">
          {new Date(r.created_at).toLocaleDateString('ar-EG')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="الاستشارات العامة"
        subtitle="متابعة استشارات المزارعين الموجهة للأطباء البيطريين عبر المنصة."
      />
      <AdminPanel>
        <AdminFilterBar>
          <AdminGovernorateDropdown
            label="تصفية بالمحافظة"
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
          />
        </AdminFilterBar>
        <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
