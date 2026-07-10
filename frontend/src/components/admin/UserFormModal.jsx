import { useEffect, useRef, useState } from 'react';
import { X, UserPlus, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import { adminInputClass, adminLabelClass, AdminGovernorateDropdown } from './AdminUI';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-[3px]"
      onMouseDown={handleBackdropClick}
      style={{ animation: 'fadeInBackdrop 0.2s ease' }}
    >
      <div
        ref={modalRef}
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col border border-stone-200/80 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.8)] admin-modal-enter"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-stone-100 bg-gradient-to-l from-[#f0f8f2] to-white rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1b4d2c] to-[#2a5c2a] flex items-center justify-center shadow-sm shadow-[#1b4d2c]/30">
              <UserPlus className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-800 leading-tight">
                {isEdit ? 'تعديل بيانات المستخدم' : 'إضافة مدير جديد'}
              </h3>
              <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                {isEdit ? 'تحديث معلومات الحساب' : 'إنشاء حساب مدير جديد للمنصة'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto smooth-scroll admin-scrollbar px-7 py-6 space-y-5 flex-1">

            {/* Name */}
            <div className="space-y-1.5">
              <label className={adminLabelClass}>
                <span className="flex items-center gap-1.5">
                  الاسم الكامل <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={fieldClass}
                placeholder="اسم المدير كاملاً"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className={adminLabelClass}>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  البريد الإلكتروني <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isEdit}
                className={`${fieldClass} disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed`}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className={adminLabelClass}>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  رقم الهاتف
                </span>
              </label>
              <input
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                className={fieldClass}
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>

            {/* Password (create only) */}
            {!isEdit && (
              <div className="space-y-1.5">
                <label className={adminLabelClass}>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    كلمة المرور <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="8 أحرف على الأقل"
                />
              </div>
            )}

            {/* Governorate */}
            <div className="space-y-1.5">
              <AdminGovernorateDropdown
                label="المحافظة"
                value={form.governorate}
                onChange={(e) => setForm((p) => ({ ...p, governorate: e.target.value }))}
                allLabel="اختر المحافظة"
              />
            </div>

            {/* Role / Status */}
            {!isEdit ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-l from-[#f0f8f2] to-[#f6fbf4] border border-[#2a5c2a]/20">
                <div className="w-8 h-8 rounded-xl bg-[#1b4d2c]/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#1b4d2c]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500">صلاحية الحساب</p>
                  <span className="inline-flex mt-1 px-3 py-0.5 rounded-full text-xs font-black bg-[#1b4d2c] text-white">
                    مدير فرعي
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className={adminLabelClass}>الحالة</label>
                <div className="relative">
                  <select
                    name="is_active"
                    value={String(form.is_active !== false)}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
                    className={adminSelectClass}
                  >
                    <option value="true">✅ نشط</option>
                    <option value="false">⛔ معطل</option>
                  </select>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-7 py-5 border-t border-stone-100 bg-gradient-to-l from-stone-50/70 to-white rounded-b-3xl shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
            >
              إلغاء
            </button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'حفظ التعديلات' : 'إنشاء المدير'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
