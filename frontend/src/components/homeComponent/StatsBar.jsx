import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectHeroStats } from '../../features/HomeDashboard/dashboardSlice'
import AnimatedCounter from '../common/AnimatedCounter'

// ─── Animated Counter Hook ───────────────────────────────────────────────────
const useCountUp = (endValue, duration = 2000, shouldStart = false) => {
  const [count, setCount] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!shouldStart) return
    const startTime = performance.now()
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * endValue))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [endValue, duration, shouldStart])

  return count
}

// ─── Single Stat Card with animated value ───────────────────────────────────
const AnimatedStatCard = ({ rawValue, label, index, isVisible }) => {
  // Parse the raw value to extract number, prefix, suffix
  const parseValue = (val) => {
    // Handle "98.2%"
    if (val.includes('%')) {
      const num = parseFloat(val)
      return { number: num * 10, display: (n) => `${(n / 10).toFixed(1)}%`, duration: 2200 }
    }
    // Handle "7/24"
    if (val.includes('/')) {
      return { number: 0, display: () => val, duration: 0, isStatic: true }
    }
    // Handle "+850" or "850+"
    const plusMatch = val.match(/\+?(\d+\.?\d*)\s*(M|K)?\+?/)
    if (plusMatch) {
      const num = parseFloat(plusMatch[1])
      const unit = plusMatch[2] || ''
      const hasPlus = val.includes('+')
      if (unit === 'M') {
        return {
          number: num * 10,
          display: (n) => `${hasPlus ? '+' : ''}${(n / 10).toFixed(1)}M`,
          duration: 2400,
        }
      }
      return {
        number: Math.round(num),
        display: (n) => `${hasPlus ? '+' : ''}${n}${unit}`,
        duration: 2000,
      }
    }
    return { number: 0, display: () => val, duration: 0, isStatic: true }
  }

  const parsed = parseValue(rawValue)
  const animatedNum = useCountUp(parsed.number, parsed.duration, isVisible)

  return (
    <div
      className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100/50 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)]"
      data-aos="zoom-in"
      data-aos-duration="600"
      data-aos-delay={index * 100}
      data-aos-once="true"
    >
      <span className="text-3xl md:text-4xl font-black text-[#1b4d2c] leading-none mb-3">
        {parsed.isStatic ? parsed.display(0) : parsed.display(animatedNum)}
      </span>
      <span className="text-gray-400 text-xs md:text-sm font-bold">
        {label}
      </span>
    </div>
  )
}

// ─── Main StatsBar Component ────────────────────────────────────────────────
const StatsBar = () => {
  const reduxStats = useSelector(selectHeroStats) || []
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer to trigger animation when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const findValue = (pattern, fallback) => {
    const found = reduxStats.find(s => s.value.toLowerCase().includes(pattern.toLowerCase()))
    return found ? found.value : fallback
  }

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
    { value: stat98, label: 'دقة التشخيص الأولي' },
    { value: stat850, label: 'مزرعة تستخدم رعاية' },
    { value: stat24, label: 'قراءة صحية تُحلل شهريًا' },
    { value: '7/24', label: 'مراقبة مستمره بلا توقف' },
  ]

  return (
    <section className="bg-[#f8f8f5] py-8 px-6" id="stats" ref={sectionRef}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <AnimatedStatCard
            key={index}
            rawValue={card.value}
            label={card.label}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>
    </section>
  )
}

export default StatsBar
