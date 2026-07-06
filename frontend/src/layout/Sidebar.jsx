// layouts/Sidebar.jsx
import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { SIDEBAR_LINKS } from '../constant/mockData'
import SidebarIcon from '../components/SidebarIcon'
import { logout } from '../redux/authSlice'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const { farmId } = useParams()
  const { farms } = useSelector((state) => state.farm || { farms: [] })
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null
  const currentFarmId = farmId || firstFarmId || ''
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('تم تسجيل الخروج بنجاح')
    navigate('/login')
    setIsOpen(false)
  }

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <div
        dir="rtl"
        className="lg:hidden fixed top-0 right-0 left-0 h-14 flex items-center justify-between px-4 bg-gradient-to-br from-[#2d5a1b] to-[#3d6b47] shadow-md z-50"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-white/40">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <circle cx="8" cy="6" r="1" fill="white" />
              <circle cx="16" cy="6" r="1" fill="white" />
              <circle
                cx="12"
                cy="14"
                r="7"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle cx="9" cy="13" r="1.2" fill="white" />
              <circle cx="15" cy="13" r="1.2" fill="white" />
            </svg>
          </div>
          <p className="text-sm font-bold text-white">رعاية</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Backdrop (mobile only, shown when sidebar open) ── */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        dir="rtl"
        className={`fixed right-0 top-0 h-screen w-56 flex flex-col bg-gradient-to-b from-[#f0f4f0] via-[#f8f9f7] to-[#f0f4f0] text-[#2d5a1b] z-40
                   shadow-lg border-l-4 border-blue-300 transition-transform duration-300 ease-in-out
                   pt-14 lg:pt-0
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo Header */}
        <div className="hidden lg:block px-4 pt-6 pb-6 bg-gradient-to-br from-[#2d5a1b] to-[#3d6b47] rounded-b-2xl shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <p className="text-sm font-bold leading-tight text-white">
                  رعاية
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border-2 border-white/40 shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                {/* القرنان - نقطتان */}
                <circle cx="8" cy="6" r="1" fill="white" />
                <circle cx="16" cy="6" r="1" fill="white" />
                {/* الوجه المدور */}
                <circle
                  cx="12"
                  cy="14"
                  r="7"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                />
                {/* العينان */}
                <circle cx="9" cy="13" r="1.2" fill="white" />
                <circle cx="15" cy="13" r="1.2" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {SIDEBAR_LINKS.map((link) => {
            const path = link.isStandalone
              ? link.path
              : link.id === 'dashboard'
                ? `/farms/${currentFarmId}`
                : `/farms/${currentFarmId}${link.path}`
            return (
              <NavLink
                key={link.id}
                to={path}
                end={link.id === 'dashboard' && !link.isStandalone}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => {
                  return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2d5a1b] to-[#3d6b47] text-white font-semibold shadow-lg'
                      : 'text-[#2d5a1b] hover:bg-white/50 hover:shadow-md'
                  }`
                }}
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3 w-full">
                    <span
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${isActive ? 'bg-white/20' : 'bg-stone-100'}`}
                    >
                      <SidebarIcon
                        name={link.icon}
                        className={`w-5 h-5 ${isActive ? 'text-white' : link.color}`}
                      />
                    </span>
                    <span className="flex-1">{link.label}</span>
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Emergency Button */}
        <div className="px-3 py-3 border-t border-stone-200">
          <button
            onClick={() => {
              navigate(`/farms/${currentFarmId}/emergencies`)
              setIsOpen(false)
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600
                       text-white text-sm font-bold py-3 rounded-xl transition-all duration-300
                       shadow-lg hover:shadow-red-600/50 hover:scale-[1.03] active:scale-95"
          >
            <span className="text-lg">✱</span>
            <span>دعم الطوارئ</span>
          </button>
        </div>

        {/* Bottom Links */}
        <div className="px-3 pb-4 bg-white rounded-t-2xl shadow-xl py-4 space-y-2 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-medium"
          >
            <span>↪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Spacer to push page content down on mobile (below top bar) */}
      <div className="lg:hidden h-14" />
    </>
  )
}
