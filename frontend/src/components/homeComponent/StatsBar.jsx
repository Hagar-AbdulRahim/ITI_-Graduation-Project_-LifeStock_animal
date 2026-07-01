import React from 'react'
import { useSelector } from 'react-redux'
import { selectHeroStats } from '../../features/HomeDashboard/dashboardSlice'

const StatsBar = () => {
  const reduxStats = useSelector(selectHeroStats) || []

  // Cleanly format and match redux state items, fallback to screenshot values if not loaded
  const findValue = (pattern, fallback) => {
    const found = reduxStats.find(s => s.value.toLowerCase().includes(pattern.toLowerCase()))
    return found ? found.value : fallback
  }

  // Format e.g., "850+" -> "+850" and "2.4M+" -> "+2.4M"
  const formatPlusPrefix = (val) => {
    if (val.endsWith('+')) {
      return '+' + val.slice(0, -1)
    }
    return val
  }

  const stat98 = findValue('98', '98.2%')
  const stat850 = formatPlusPrefix(findValue('850', '850+'))
  const stat24 = formatPlusPrefix(findValue('2.4', '2.4M+'))

  const cards = [
    {
      value: stat98,
      label: 'دقة التشخيص الأولي'
    },
    {
      value: stat850,
      label: 'مزرعة تستخدم رعاية'
    },
    {
      value: stat24,
      label: 'قراءة صحية تُحلل شهريًا'
    },
    {
      value: '7/24',
      label: 'مراقبة مستمره بلا توقف'
    }
  ]

  return (
    <section className="bg-[#f8f8f5] py-8 px-6" id="stats">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100/50 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)]"
            data-aos="zoom-in"
            data-aos-duration="600"
            data-aos-delay={index * 100}
            data-aos-once="true"
          >
            <span className="text-3xl md:text-4xl font-black text-[#1b4d2c] leading-none mb-3">
              {card.value}
            </span>
            <span className="text-gray-400 text-xs md:text-sm font-bold">
              {card.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StatsBar
