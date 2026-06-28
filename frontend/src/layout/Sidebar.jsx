// layouts/Sidebar.jsx
import { useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { SIDEBAR_LINKS } from '../constant/mockData'
import SidebarIcon from '../components/SidebarIcon'
import { logout } from '../redux/authSlice'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)
  const { farmId } = useParams()
  const { farms } = useSelector((state) => state.farm || { farms: [] })
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null
  const currentFarmId = farmId || firstFarmId || ''
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    toast.success('تم تسجيل الخروج بنجاح')
    navigate('/login')
  }

  return (
    <>
      <aside
        dir="rtl"
        className="fixed right-0 top-0 h-screen w-56 flex flex-col bg-gradient-to-b from-[#f0f4f0] via-[#f8f9f7] to-[#f0f4f0] text-[#2d5a1b] z-40
                   shadow-lg border-l-4 border-blue-300"
      >
        {/* Logo Header */}
        <div className="px-4 pt-6 pb-6 bg-gradient-to-br from-[#2d5a1b] to-[#3d6b47] rounded-b-2xl shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <p className="text-sm font-bold leading-tight text-white">
                  رعاية الماشية AI
                </p>
                <p className="text-[10px] text-green-100">الصحة الدقيقة</p>
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
            onClick={() => setShowEmergencyConfirm(true)}
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
          <button className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-[#2d5a1b] hover:bg-stone-100 transition-all duration-300 font-medium">
            <span>⚙</span> الإعدادات
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-medium"
          >
            <span>↪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {showEmergencyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-100 p-6 animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            <div className="flex items-center gap-2 mb-4 text-red-600 font-bold">
              <span className="text-xl">🚨</span>
              <h3 className="text-sm font-bold text-stone-800">
                تأكيد طلب دعم الطوارئ
              </h3>
            </div>

            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              أنت على وشك تفعيل دعم الطوارئ. سيقوم هذا الإجراء بإرسال تنبيه عاجل
              لجميع الأطباء البيطريين المناوبين والمسؤولين عن رعاية الحظيرة
              وتوفير تفاصيل الاتصال الفورية. هل أنت متأكد من الاستمرار؟
            </p>

            <div className="flex gap-3 justify-end text-xs">
              <button
                onClick={() => {
                  toast.success(
                    'تم إرسال بلاغ الطوارئ بنجاح! سيتم التواصل معك فورا.',
                  )
                  setShowEmergencyConfirm(false)
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 shadow-md active:scale-95"
              >
                تأكيد الاتصال
              </button>
              <button
                onClick={() => setShowEmergencyConfirm(false)}
                className="px-4 py-2.5 border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-600 font-semibold transition-all duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
