import { Search, ChevronDown } from 'lucide-react';

/* ── Shared class tokens ── */
export const adminInputClass =
  'w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-[#2a5c2a]/40 focus:border-[#2a5c2a] focus:ring-2 focus:ring-[#2a5c2a]/15';

export const adminSelectClass =
  'w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none transition-all duration-200 cursor-pointer hover:border-[#2a5c2a]/40 focus:border-[#2a5c2a] focus:ring-2 focus:ring-[#2a5c2a]/15 appearance-none';

export const adminLabelClass = 'block text-xs font-bold text-stone-500 mb-1.5';

export const adminPanelClass =
  'bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_24px_-4px_rgba(42,92,42,0.12)]';

export const adminFilterPanelClass =
  'bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-4 mb-5';

export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-stone-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-stone-500 font-medium">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminPanel({ children, className = '' }) {
  return (
    <div className={`${adminPanelClass} p-5 lg:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminFilterBar({ children }) {
  return (
    <div className={adminFilterPanelClass}>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function AdminSearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`relative flex-1 min-w-[220px] ${className}`}>
      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${adminInputClass} pr-10`}
      />
    </div>
  );
}

export function AdminSelect({ value, onChange, children, label, className = '' }) {
  return (
    <div className={`relative min-w-[180px] ${className}`}>
      {label && <label className={adminLabelClass}>{label}</label>}
      <select value={value} onChange={onChange} className={adminSelectClass}>
        {children}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
    </div>
  );
}

export function AdminPrimaryButton({ children, onClick, type = 'button', disabled, active }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 ${
        active
          ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          : 'bg-gradient-to-l from-[#1b4d2c] to-[#2a5c2a] text-white hover:shadow-md hover:brightness-105'
      }`}
    >
      {children}
    </button>
  );
}

export function AdminDetailBtn({ onClick, label = 'عرض التفاصيل' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2a5c2a] bg-white border border-stone-200 rounded-lg hover:bg-[#2a5c2a]/5 hover:border-[#2a5c2a]/30 transition-all duration-200"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {label}
    </button>
  );
}

export function AdminStatusBadge({ active, activeLabel = 'نشط', inactiveLabel = 'معطل' }) {
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${
        active
          ? 'bg-emerald-50 text-[#1b4d2c] border-emerald-200'
          : 'bg-stone-100 text-stone-500 border-stone-200'
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function AdminUserAvatar({ name }) {
  const initial = name?.charAt(0) || 'م';
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2a5c2a]/10 text-[#1b4d2c] text-sm font-black border border-[#2a5c2a]/20 shrink-0">
      {initial}
    </span>
  );
}
