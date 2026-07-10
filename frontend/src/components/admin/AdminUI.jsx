import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

/* ── Shared class tokens ── */
export const adminInputClass =
  'w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-[#1b4d2c] font-bold outline-none transition-all duration-200 placeholder:text-stone-400 ' +
  'hover:border-[#1b4d2c]/40 ' +
  'focus:border-[#1b4d2c] focus:ring-2 focus:ring-[#1b4d2c]/12 focus:shadow-[0_0_0_3px_rgba(27,77,44,0.08)]';

export const adminSelectClass =
  'w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1b4d2c] outline-none transition-all duration-200 cursor-pointer appearance-none ' +
  'hover:border-[#1b4d2c]/40 ' +
  'focus:border-[#1b4d2c] focus:ring-2 focus:ring-[#1b4d2c]/12 focus:shadow-[0_0_0_3px_rgba(27,77,44,0.08)]';

export const adminLabelClass =
  'block text-[11px] font-black text-stone-500 uppercase tracking-wider mb-1.5';

export const adminPanelClass =
  'bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 ' +
  'hover:shadow-[0_4px_28px_-4px_rgba(27,77,44,0.12)]';

export const adminFilterPanelClass =
  'bg-[#1b4d2c] rounded-2xl border border-[#2a5c2a]/30 shadow-md p-5 mb-5 green-filter-bar';


/* ── Page Header ── */
export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
      <div className="flex flex-col gap-1.5">
        {/* Premium pill title */}
        <div className="inline-flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1b4d2c]/25 bg-gradient-to-l from-[#f0f8f2] to-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1b4d2c] animate-pulse" />
            <h2 className="text-sm font-black text-[#1b4d2c] tracking-tight">{title}</h2>
          </div>
        </div>
        {subtitle && (
          <p className="text-sm text-stone-400 font-medium pr-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Panel ── */
export function AdminPanel({ children, className = '' }) {
  return (
    <div className={`${adminPanelClass} p-5 lg:p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ── Filter Bar ── */
export function AdminFilterBar({ children }) {
  return (
    <div className={adminFilterPanelClass}>
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </div>
  );
}

/* ── Search Input ── */
export function AdminSearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`relative flex-1 min-w-[240px] ${className}`}>
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

/* ── Select ── */
export function AdminSelect({ value, onChange, children, label, className = '' }) {
  return (
    <div className={`relative min-w-[190px] ${className}`}>
      {label && <label className={adminLabelClass}>{label}</label>}
      <select value={value} onChange={onChange} className={adminSelectClass}>
        {children}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1b4d2c] pointer-events-none" style={{ top: label ? 'calc(50% + 10px)' : '50%' }} />
    </div>
  );
}

/* ── Primary Button ── */
export function AdminPrimaryButton({ children, onClick, type = 'button', disabled, active }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${active
          ? 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
          : 'bg-gradient-to-l from-[#1b4d2c] to-[#2a5c2a] text-white hover:shadow-md hover:shadow-[#1b4d2c]/25 hover:brightness-105 active:scale-[0.97]'
        }`}
    >
      {children}
    </button>
  );
}

/* ── Detail Button ── */
export function AdminDetailBtn({ onClick, label = 'عرض التفاصيل' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1b4d2c] bg-[#f0f8f2] border border-[#2a5c2a]/20 rounded-lg hover:bg-[#1b4d2c] hover:text-white hover:border-[#1b4d2c] transition-all duration-200 shadow-sm"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {label}
    </button>
  );
}

/* ── Status Badge ── */
export function AdminStatusBadge({ active, activeLabel = 'نشط', inactiveLabel = 'معطل' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-100'
          : 'bg-stone-100 text-stone-500 border-stone-200/80'
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/* ── User Avatar ── */
export function AdminUserAvatar({ name }) {
  const initial = name?.charAt(0) || 'م';
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b4d2c]/15 to-[#2a5c2a]/10 text-[#1b4d2c] text-sm font-black border border-[#2a5c2a]/20 shrink-0 shadow-sm">
      {initial}
    </span>
  );
}
