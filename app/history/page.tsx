'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { FoodLog } from '@/types'
import { formatCalories } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import FoodLogItem from '@/components/FoodLogItem'
import { format, subDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { History, Utensils } from 'lucide-react'

interface DayGroup {
  date: string
  logs: FoodLog[]
  totalCalories: number
}

export default function HistoryPage() {
  const [groups, setGroups] = useState<DayGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [goalCalories, setGoalCalories] = useState(2000)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const sevenDaysAgo = subDays(new Date(), 6).toISOString().split('T')[0]

      const [profileRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('daily_calorie_goal').eq('id', user.id).single(),
        supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', sevenDaysAgo)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
      ])

      if (profileRes.data) setGoalCalories(profileRes.data.daily_calorie_goal)

      if (logsRes.data) {
        const grouped: Record<string, FoodLog[]> = {}
        logsRes.data.forEach((log: FoodLog) => {
          if (!grouped[log.date]) grouped[log.date] = []
          grouped[log.date].push(log)
        })
        const result: DayGroup[] = Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, logs]) => ({
            date,
            logs,
            totalCalories: logs.reduce((s, l) => s + l.calories, 0),
          }))
        setGroups(result)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [])

  // Build 7-day chart data
  const today = new Date()
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i)
    const dateStr = d.toISOString().split('T')[0]
    const group = groups.find(g => g.date === dateStr)
    return { date: dateStr, label: format(d, 'EEE', { locale: localeId }), calories: group?.totalCalories ?? 0 }
  })
  const maxCalories = Math.max(...chartDays.map(d => d.calories), goalCalories)

  const handleDelete = (id: string, date: string) => {
    setGroups(prev => prev.map(g => {
      if (g.date !== date) return g
      const newLogs = g.logs.filter(l => l.id !== id)
      return { ...g, logs: newLogs, totalCalories: newLogs.reduce((s, l) => s + l.calories, 0) }
    }).filter(g => g.logs.length > 0))
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Riwayat</h1>
            <p className="text-xs text-neutral-500">7 hari terakhir</p>
          </div>
        </div>

        {/* Bar Chart */}
        {!loading && (
          <div className="card p-4 mb-6">
            <p className="text-xs text-neutral-500 mb-4 uppercase tracking-wide">Kalori Mingguan</p>
            <div className="flex items-end gap-2 h-28">
              {chartDays.map(day => {
                const pct = maxCalories > 0 ? (day.calories / maxCalories) * 100 : 0
                const isToday = day.date === today.toISOString().split('T')[0]
                const overGoal = day.calories > goalCalories
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                      <div
                        className={`w-full rounded-lg transition-all duration-700 ${
                          overGoal ? 'bg-rose-500' : isToday ? 'bg-orange-400' : 'bg-neutral-700'
                        }`}
                        style={{ height: `${Math.max(pct, day.calories > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-medium capitalize ${isToday ? 'text-orange-400' : 'text-neutral-500'}`}>
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Goal line label */}
            <p className="text-xs text-neutral-600 mt-2 text-right">
              Target: {goalCalories.toLocaleString()} kal
            </p>
          </div>
        )}

        {/* Day groups */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 skeleton rounded w-32" />
                <div className="h-20 skeleton rounded-2xl" />
                <div className="h-20 skeleton rounded-2xl" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Utensils className="w-12 h-12 text-neutral-700 mb-4" />
            <p className="text-neutral-400 text-sm">Belum ada riwayat makanan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(group => {
              const label = group.date === today.toISOString().split('T')[0]
                ? 'Hari Ini'
                : format(new Date(group.date), 'EEEE, d MMMM', { locale: localeId })
              return (
                <div key={group.date}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white capitalize">{label}</p>
                    <span className="text-xs font-medium text-orange-400">
                      {formatCalories(group.totalCalories)} kal
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.logs.map(log => (
                      <FoodLogItem
                        key={log.id}
                        log={log}
                        onDelete={id => handleDelete(id, group.date)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
