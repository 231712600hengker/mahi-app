'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { FoodLog, DailySummary, Profile } from '@/types'
import { getToday } from '@/lib/utils'
import CalorieRing from '@/components/CalorieRing'
import MacroBars from '@/components/MacroBars'
import FoodLogItem from '@/components/FoodLogItem'
import BottomNav from '@/components/BottomNav'
import { RingSkeleton, FoodLogSkeleton, MacroBarSkeleton } from '@/components/Skeletons'
import Link from 'next/link'
import { Camera, Plus, Utensils } from 'lucide-react'
import { format, subDays, addDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function HomePage() {
  const [date, setDate] = useState(getToday())
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const isToday = date === getToday()
  const canGoForward = date < getToday()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('food_logs').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: false }),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (logsRes.data) setLogs(logsRes.data)
    setLoading(false)
  }, [date])

  useEffect(() => { fetchData() }, [fetchData])

  const summary: DailySummary = {
    total_calories: logs.reduce((s, l) => s + l.calories, 0),
    total_protein: logs.reduce((s, l) => s + l.protein, 0),
    total_carbs: logs.reduce((s, l) => s + l.carbs, 0),
    total_fat: logs.reduce((s, l) => s + l.fat, 0),
    total_fiber: logs.reduce((s, l) => s + l.fiber, 0),
    logs,
  }

  const goal = profile?.daily_calorie_goal ?? 2000

  const shiftDate = (days: number) => {
    const d = new Date(date)
    const next = days > 0 ? addDays(d, days) : subDays(d, Math.abs(days))
    setDate(next.toISOString().split('T')[0])
  }

  const handleDelete = (id: string) => setLogs(prev => prev.filter(l => l.id !== id))

  const dateLabel = date === getToday()
    ? 'Hari Ini'
    : format(new Date(date), 'EEEE, d MMMM', { locale: localeId })

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Selamat Makan 👋</p>
            <h1 className="text-xl font-bold text-white mt-0.5">
              {profile?.full_name?.split(' ')[0] ?? 'Kamu'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all text-lg font-bold"
          >‹</button>
          <p className="text-sm font-semibold text-white">{dateLabel}</p>
          <button
            onClick={() => shiftDate(1)}
            disabled={!canGoForward}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all disabled:opacity-30 text-lg font-bold"
          >›</button>
        </div>

        {/* Calorie Ring */}
        <div className="card p-6 mb-4 flex items-center justify-center">
          {loading ? <RingSkeleton /> : (
            <CalorieRing consumed={summary.total_calories} goal={goal} />
          )}
        </div>

        {/* Macro Bars */}
        {loading ? <MacroBarSkeleton /> : <MacroBars summary={summary} />}

        {/* Food Log List */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Makanan Hari Ini</p>
            {isToday && (
              <Link href="/log" className="text-xs text-orange-400 font-medium flex items-center gap-1 hover:text-orange-300">
                <Plus className="w-3.5 h-3.5" />Tambah
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <FoodLogSkeleton key={i} />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
                <Utensils className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="text-neutral-400 text-sm">Belum ada makanan yang dicatat</p>
              {isToday && (
                <Link href="/log" className="mt-4 btn-primary text-sm px-6 py-2.5">
                  <Camera className="w-4 h-4" />
                  Scan Makanan
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <FoodLogItem key={log.id} log={log} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {isToday && (
        <Link
          href="/log"
          id="fab-log-food"
          className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all z-50"
        >
          <Camera className="w-6 h-6 text-white" />
        </Link>
      )}

      <BottomNav />
    </div>
  )
}
