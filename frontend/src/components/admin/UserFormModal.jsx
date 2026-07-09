import { useEffect, useRef, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import Button from '../common/Button';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';
import { adminInputClass, adminSelectClass, adminLabelClass } from './AdminUI';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  governorate: 'القاهرة',
  role: 'sub_admin',
};

export default function UserFormModal({ open, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState(emptyForm);
  const modalRef = useRef(null);
  const isEdit = Boolean(initialData?._id);

  useEffect(() => {
    if (initialData) {
      setForm({ ...emptyForm, ...initialData, password: '' });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  const fieldClass = `${adminInputClass} hover:shadow-sm`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[2px]"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-stone-200 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-l from-[#f6fbf4] to-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#2a5c2a]/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#1b4d2c]" />
            </span>
            <h3 className="text-base font-black text-stone-800">
              {isEdit ? 'تعديل مستخدم' : 'إضافة مدير جديد'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto smooth-scroll custom-scrollbar px-6 py-5 space-y-4 flex-1">
            <div>
              <label className={adminLabelClass}>الاسم *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={fieldClass} placeholder="اسم المدير" />
            </div>
            <div>
              <label className={adminLabelClass}>البريد الإلكتروني *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required disabled={isEdit} className={`${fieldClass} disabled:bg-stone-50 disabled:text-stone-400`} placeholder="email@example.com" />
            </div>
            <div>
              <label className={adminLabelClass}>الهاتف</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} className={fieldClass} placeholder="01xxxxxxxxx" />
            </div>
            {!isEdit && (
              <div>
                <label className={adminLabelClass}>كلمة المرور *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required className={fieldClass} placeholder="8 أحرف على الأقل" />
              </div>
            )}
            <div>
              <label className={adminLabelClass}>المحافظة</label>
              <select name="governorate" value={form.governorate} onChange={handleChange} className={adminSelectClass}>
                {EGYPTIAN_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {!isEdit ? (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f6fbf4] border border-[#2a5c2a]/20">
                <span className="text-xs font-bold text-stone-500">الدور:</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#2a5c2a]/10 text-[#1b4d2c] border border-[#2a5c2a]/25">مدير</span>
              </div>
            ) : (
              <div>
                <label className={adminLabelClass}>الحالة</label>
                <select
                  name="is_active"
                  value={String(form.is_active !== false)}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
                  className={adminSelectClass}
                >
                  <option value="true">نشط</option>
                  <option value="false">معطل</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end px-6 py-4 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" loading={loading}>{isEdit ? 'حفظ' : 'إنشاء المدير'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
