import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  governorate: 'القاهرة',
  role: 'doctor',
  specialization: '',
  license_number: '',
  assigned_governorates: [],
};

export default function UserFormModal({ open, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(initialData?._id);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        password: '',
        assigned_governorates: initialData.assigned_governorates || [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGovernorate = (gov) => {
    setForm((prev) => {
      const list = prev.assigned_governorates.includes(gov)
        ? prev.assigned_governorates.filter((g) => g !== gov)
        : [...prev.assigned_governorates, gov];
      return { ...prev, assigned_governorates: list };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6" dir="rtl">
        <h3 className="text-lg font-bold text-stone-800 mb-4">
          {isEdit ? 'تعديل مستخدم' : 'إنشاء مستخدم جديد'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="الاسم" name="name" value={form.name} onChange={handleChange} required />
          <Input label="البريد الإلكتروني" name="email" type="email" value={form.email} onChange={handleChange} required disabled={isEdit} />
          <Input label="الهاتف" name="phone" value={form.phone || ''} onChange={handleChange} />
          {!isEdit && (
            <Input label="كلمة المرور" name="password" type="password" value={form.password} onChange={handleChange} required />
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">المحافظة</label>
            <select name="governorate" value={form.governorate} onChange={handleChange} className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm">
              {EGYPTIAN_GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">الدور</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm">
              <option value="doctor">طبيب بيطري</option>
              <option value="admin">مدير</option>
              <option value="user">مزارع</option>
            </select>
          </div>

          {form.role === 'doctor' && (
            <>
              <Input label="التخصص" name="specialization" value={form.specialization || ''} onChange={handleChange} />
              <Input label="رقم الترخيص" name="license_number" value={form.license_number || ''} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">المحافظات المخصصة (فارغ = الكل)</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {EGYPTIAN_GOVERNORATES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGovernorate(g)}
                      className={`text-xs px-2 py-1 rounded-lg border ${form.assigned_governorates.includes(g) ? 'bg-[#2d5a1b] text-white border-[#2d5a1b]' : 'border-stone-200 text-stone-600'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">الحالة</label>
              <select
                name="is_active"
                value={String(form.is_active !== false)}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="true">نشط</option>
                <option value="false">معطل</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" loading={loading}>{isEdit ? 'حفظ' : 'إنشاء'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
