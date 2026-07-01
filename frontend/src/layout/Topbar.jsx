// layouts/Topbar.jsx
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Topbar() {
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3
                 bg-white/70 backdrop-blur-md border-b border-stone-200 shadow-sm"
    >
      {/* User Info */}
      <div className="flex items-center gap-3">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-lg object-cover shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-[#2d5a1b] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            {user?.name?.charAt(0) || 'س'}
          </div>
        )}
        <div className="leading-tight">
          <p className="text-sm font-semibold text-stone-800">
            {user?.name || 'المستخدم'}
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <input
          type="text"
          placeholder="ابحث عن معرف الحيوان، السجلات الصحية..."
          className="w-72 pr-10 pl-4 py-2 text-sm rounded-lg border border-stone-200
                     bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#3d6b47]/30
                     focus:border-[#3d6b47] transition-all placeholder:text-stone-400"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

    </header>
  )
}
