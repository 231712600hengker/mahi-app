'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '/history', icon: History, label: 'Riwayat' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all',
                isActive ? 'text-orange-400' : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-all', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
