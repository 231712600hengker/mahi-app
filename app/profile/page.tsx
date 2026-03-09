'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'
import BottomNav from '@/components/BottomNav'
import { useRouter } from 'next/navigation'
import { User, Target, LogOut, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editGoal, setEditGoal] = useState(2000)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setEditName(data.full_name ?? '')
        setEditGoal(data.daily_calorie_goal)
      }
      setLoading(false)
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName, daily_calorie_goal: editGoal })
      .eq('id', profile.id)
    setSaving(false)
    if (error) toast.error('Gagal menyimpan')
    else toast.success('Profil disimpan!')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Profil</h1>
            <p className="text-xs text-neutral-500">{profile?.email}</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-500/20">
            {editName?.[0]?.toUpperCase() ?? '?'}
          </div>
        </div>

        {/* Edit form */}
        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Informasi Pribadi</p>
            <div>
              <label className="text-xs text-neutral-400 block mb-1.5">Nama Lengkap</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="input-field"
                placeholder="Nama kamu"
              />
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Target Kalori Harian</p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1000}
                  max={4000}
                  step={50}
                  value={editGoal}
                  onChange={e => setEditGoal(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-white font-bold text-sm w-20 text-right">
                  {editGoal.toLocaleString()} kal
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-600 mt-1">
                <span>1.000</span>
                <span>4.000</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>

          <button
            onClick={handleSignOut}
            className="btn-secondary w-full text-rose-400 hover:bg-rose-400/10 border border-rose-400/20"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
