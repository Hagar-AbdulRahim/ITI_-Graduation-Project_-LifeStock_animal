import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', type = 'danger' }) {
  if (!open) return null;

  const typeConfig = {
    danger: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      btnBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    success: {
      bg: 'bg-[#f0f8f2]',
      iconBg: 'bg-[#1b4d2c]/10',
      iconColor: 'text-[#1b4d2c]',
      btnBg: 'bg-[#1b4d2c] hover:bg-[#2a5c2a] focus:ring-[#1b4d2c]',
    },
  };

  const conf = typeConfig[type] || typeConfig.danger;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-[3px]"
      onMouseDown={onClose}
      style={{ animation: 'fadeInBackdrop 0.2s ease' }}
    >
      <div
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md p-6 border border-stone-200/80 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.3)] admin-modal-enter"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className={`w-10 h-10 rounded-2xl ${conf.iconBg} flex items-center justify-center shrink-0`}>
              <AlertTriangle className={`w-5 h-5 ${conf.iconColor}`} />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-800 leading-tight">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-stone-500 font-medium leading-relaxed mb-6 pr-1">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-700 font-bold hover:bg-stone-50 transition-all duration-200 text-sm shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 ${conf.btnBg} text-white rounded-xl font-bold transition-all duration-200 text-sm shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
