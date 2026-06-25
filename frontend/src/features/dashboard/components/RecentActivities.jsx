// features/dashboard/components/RecentActivities.jsx
import { useSelector } from 'react-redux'
import { Activity, Syringe, Thermometer, CheckCircle2 } from 'lucide-react'

const ACTIVITY_STYLES = {
  vaccination: { Icon: Syringe,      bg: 'bg-blue-50',  text: 'text-blue-500'  },
  alert:       { Icon: Thermometer,  bg: 'bg-red-50',   text: 'text-red-500'   },
  success:     { Icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-500' },
  default:     { Icon: Activity,     bg: 'bg-stone-50', text: 'text-stone-500' },
}

export default function RecentActivities() {
  const mockActivities = useSelector((state) => state.dashboard.recentActivities)
  const farmStats      = useSelector((state) => state.farm.farmStats)

  const activities = farmStats?.stats?.recent_activities ?? mockActivities

  return (
    <div className='bg-white rounded-2xl p-5 shadow-sm border border-stone-100 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-bold text-stone-700'>الأنشطة الأخيرة</h3>
        <button className='text-xs text-[#3d6b47] font-medium hover:underline transition-all'>
          عرض الكل
        </button>
      </div>

      {/* Activity List */}
      <div className='flex-1 space-y-4'>
        {activities.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full py-8 text-stone-400 text-sm text-center'>
            <Activity className='w-8 h-8 mb-2 opacity-40' />
            <p>لا توجد أنشطة حديثة بعد</p>
            <p className='text-xs mt-1'>ستظهر هنا عند إضافة حيوانات أو تسجيل حالات</p>
          </div>
        ) : (
          activities.map((activity, i) => {
            const s = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.default
            const { Icon } = s
            return (
              <div
                key={activity.id ?? i}
                className='flex items-start gap-3 group'
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${s.text}`} />
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-stone-700 leading-snug'>{activity.text}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-[11px] text-stone-400'>{activity.time}</span>
                    {activity.actor && (
                      <>
                        <span className='w-0.5 h-0.5 bg-stone-300 rounded-full' />
                        <span className='text-[11px] text-stone-400'>{activity.actor}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
