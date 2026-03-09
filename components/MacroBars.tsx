import { DailySummary } from '@/types'

interface MacroBarsProps {
  summary: DailySummary
}

interface MacroItem {
  label: string
  value: number
  goal: number
  unit: string
  color: string
  bg: string
}

export default function MacroBars({ summary }: MacroBarsProps) {
  const macros: MacroItem[] = [
    { label: 'Protein', value: summary.total_protein, goal: 60, unit: 'g', color: 'bg-blue-400', bg: 'bg-blue-400/15' },
    { label: 'Karbohdrat', value: summary.total_carbs, goal: 250, unit: 'g', color: 'bg-yellow-400', bg: 'bg-yellow-400/15' },
    { label: 'Lemak', value: summary.total_fat, goal: 65, unit: 'g', color: 'bg-rose-400', bg: 'bg-rose-400/15' },
    { label: 'Serat', value: summary.total_fiber, goal: 25, unit: 'g', color: 'bg-emerald-400', bg: 'bg-emerald-400/15' },
  ]

  return (
    <div className="card p-4 space-y-4">
      <p className="text-sm font-semibold text-white">Makro Nutrisi</p>
      {macros.map(macro => {
        const pct = Math.min((macro.value / macro.goal) * 100, 100)
        return (
          <div key={macro.label} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">{macro.label}</span>
              <span className="text-xs font-medium text-white">
                {Math.round(macro.value)}{macro.unit}
                <span className="text-neutral-600"> / {macro.goal}{macro.unit}</span>
              </span>
            </div>
            <div className={`h-2 rounded-full ${macro.bg} overflow-hidden`}>
              <div
                className={`h-full rounded-full ${macro.color} transition-all duration-700 ease-out`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
