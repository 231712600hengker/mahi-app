'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Utensils, Mail, Lock, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      if (data.user) {
        // Create profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          daily_calorie_goal: 2000,
        })
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Pendaftaran gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
          <Utensils className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">MAHI</h1>
        <p className="text-neutral-400 text-sm mt-1">Makan Apa Hari Ini?</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="password"
            placeholder="Password (min. 6 karakter)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      </form>

      <p className="text-center text-neutral-500 text-sm mt-6">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="text-orange-400 font-medium hover:text-orange-300">
          Masuk
        </Link>
      </p>
    </div>
  )
}
