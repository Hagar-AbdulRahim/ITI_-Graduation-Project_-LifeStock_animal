import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    governorate: EGYPTIAN_GOVERNORATES[0],
    address: '',
    phone: '',
    opening_hours: '',
    latitude: '',
    longitude: '',
  });

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getClinics({ page: 1, limit: 100 });
      setClinics(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch {
      toast.error('فشل تحميل العيادات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const resetForm = () => {
    setForm({
      name: '',
      governorate: EGYPTIAN_GOVERNORATES[0],
      address: '',
      phone: '',
      opening_hours: '',
      latitude: '',
      longitude: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };

      if (editingId) {
        await adminService.updateClinic(editingId, payload);
        toast.success('تم تحديث العيادة');
      } else {
        await adminService.createClinic(payload);
        toast.success('تم إضافة العيادة');
      }
      resetForm();
      fetchClinics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حفظ العيادة');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (clinic) => {
    setEditingId(clinic._id);
    setForm({
      name: clinic.name || '',
      governorate: clinic.governorate || EGYPTIAN_GOVERNORATES[0],
      address: clinic.address || '',
      phone: clinic.phone || '',
      opening_hours: clinic.opening_hours || '',
      latitude: clinic.latitude ?? '',
      longitude: clinic.longitude ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('حذف هذه العيادة؟')) return;
    try {
      await adminService.deleteClinic(id);
      toast.success('تم حذف العيادة');
      fetchClinics();
    } catch {
      toast.error('فشل حذف العيادة');
    }
  };

  const columns = [
    { key: 'name', label: 'اسم العيادة', render: (r) => <span className="font-bold text-stone-800">{r.name}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'phone', label: 'التليفون', render: (r) => <span className="text-stone-600">{r.phone || '—'}</span> },
    { key: 'address', label: 'العنوان', className: 'whitespace-normal min-w-[220px]', render: (r) => <span className="text-stone-500 text-xs">{r.address || '—'}</span> },
    { key: 'hours', label: 'مواعيد العمل', render: (r) => <span className="text-stone-500 text-xs">{r.opening_hours || '—'}</span> },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <div className="flex gap-3">
          <button type="button" onClick={() => handleEdit(r)} className="text-blue-600 text-xs font-bold hover:underline">تعديل</button>
          <button type="button" onClick={() => handleDelete(r._id)} className="text-red-600 text-xs font-bold hover:underline">حذف</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">إدارة العيادات البيطرية</h2>
          <p className="text-sm text-stone-500 font-medium">إضافة وتعديل وحذف العيادات المعروضة للمستخدمين.</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); if (showForm) resetForm(); }}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all ${showForm ? 'bg-stone-200 text-stone-700' : 'bg-gradient-to-l from-[#2a5c2a] to-[#3d8c40] text-white'}`}
        >
          {showForm ? 'إلغاء' : '+ إضافة عيادة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/90 rounded-3xl p-6 border border-white shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
          <h3 className="text-lg font-bold text-stone-800 mb-4">{editingId ? 'تعديل العيادة' : 'عيادة جديدة'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">اسم العيادة *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">المحافظة *</label>
              <select value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm">
                {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-stone-500">العنوان</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">التليفون</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">مواعيد العمل</label>
              <input value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">خط العرض</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">خط الطول</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="w-full border-none bg-stone-50 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={resetForm} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold">إلغاء</button>
              <button type="submit" disabled={saving} className="px-8 py-3 bg-[#2a5c2a] hover:bg-[#244d24] text-white rounded-xl font-bold shadow-md disabled:opacity-60">
                {saving ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديل' : 'إضافة العيادة'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/80 rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-hidden rounded-2xl border border-stone-100/80 bg-white/50">
          <DataTable columns={columns} data={clinics} loading={loading} pagination={pagination} />
        </div>
      </div>
    </div>
  );
}
