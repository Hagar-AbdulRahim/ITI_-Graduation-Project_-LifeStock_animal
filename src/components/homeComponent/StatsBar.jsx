import React from 'react'
import { useSelector } from 'react-redux'
import { selectHeroStats } from '../../features/HomeDashboard/dashboardSlice'

const StatsBar = () => {
  const stats = useSelector(selectHeroStats)

  return (
    <div className="flex items-center gap-0 mt-8">
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center px-6 first:pr-0">
            <span className="text-2xl font-bold text-text-dark leading-tight">{stat.value}</span>
            <span className="text-xs text-text-gray mt-0.5">{stat.label}</span>
          </div>
          {index < stats.length - 1 && (
            <div className="w-px h-10 bg-gray-300 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default StatsBar
