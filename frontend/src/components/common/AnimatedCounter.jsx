import React, { useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

const AnimatedCounter = ({ value }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-50px" })

  const match = String(value).match(/^([^0-9]*)([0-9.]+)(.*)$/)
  
  const startNum = match ? parseFloat(match[2]) * 0.5 : 0
  const decimalPlaces = match && match[2].includes('.') ? match[2].split('.')[1].length : 0
  
  let initialValue = value;
  if (value === '7/24') {
    initialValue = '1/0'
  } else if (value === '24/7') {
    initialValue = '0/1'
  } else if (match) {
    initialValue = `${match[1]}${startNum.toFixed(decimalPlaces)}${match[3]}`
  }

  useEffect(() => {
    if (!isInView) {
      if (ref.current) ref.current.textContent = initialValue
      return
    }

    if (value === '7/24' || value === '24/7') {
      const controls = animate(0, 1, {
        duration: 0.8,
        ease: "easeOut",
        onUpdate(progress) {
          if (value === '7/24') {
            const days = Math.round(1 + (progress * 6))
            const hours = Math.round(progress * 24)
            if (ref.current) ref.current.textContent = `${days}/${hours}`
          } else {
            const hours = Math.round(progress * 24)
            const days = Math.round(1 + (progress * 6))
            if (ref.current) ref.current.textContent = `${hours}/${days}`
          }
        }
      })
      return () => controls.stop()
    }

    if (!match) {
      if (ref.current) ref.current.textContent = value
      return
    }

    const prefix = match[1]
    const numStr = match[2]
    const suffix = match[3]
    const num = parseFloat(numStr)

    const startValue = num * 0.5

    const controls = animate(startValue, num, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate(currentValue) {
        if (ref.current) {
          ref.current.textContent = `${prefix}${currentValue.toFixed(decimalPlaces)}${suffix}`
        }
      },
    })

    return () => controls.stop()
  }, [isInView, value, match, decimalPlaces])

  return <span ref={ref}>{initialValue}</span>
}

export default AnimatedCounter
