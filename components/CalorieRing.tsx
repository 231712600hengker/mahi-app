'use client'

import { useMemo } from 'react'
import { getProgressRingColor } from '@/lib/utils'

interface CalorieRingProps {
  consumed: number
  goal: number
}

export default function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const percentage = Math.min((consumed / goal) * 100, 110)
  const remaining = Math.max(goal - consumed, 0)

  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference

  const color = useMemo(() => getProgressRingColor(percentage), [percentage])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          {/* Track */}
          <circle
            stroke="#2c2c2e"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white leading-none">
            {Math.round(consumed).toLocaleString()}
          </span>
          <span className="text-xs text-neutral-400 mt-1">kal dikonsumsi</span>
        </div>
      </div>

      <div className="mt-4 flex gap-6 text-center">
        <div>
          <p className="text-xs text-neutral-500">Target</p>
          <p className="text-sm font-semibold text-white">{goal.toLocaleString()}</p>
        </div>
        <div className="w-px bg-neutral-800" />
        <div>
          <p className="text-xs text-neutral-500">Sisa</p>
          <p className={`text-sm font-semibold ${remaining === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {remaining.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
