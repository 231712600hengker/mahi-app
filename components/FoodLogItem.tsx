'use client'

import { useState } from 'react'
import { FoodLog } from '@/types'
import { formatCalories, formatMacro } from '@/lib/utils'
import { Trash2, ChevronDown, ChevronUp, Utensils } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface FoodLogItemProps {
  log: FoodLog
  onDelete: (id: string) => void
}

export default function FoodLogItem({ log, onDelete }: FoodLogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('food_logs').delete().eq('id', log.id)
    if (error) {
      toast.error('Gagal menghapus')
      setDeleting(false)
    } else {
      toast.success('Log dihapus')
      onDelete(log.id)
    }
  }

  return (
    <div className="card p-3 transition-all">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Thumbnail or placeholder */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 flex items-center justify-center">
          {log.image_url ? (
            <Image src={log.image_url} alt={log.food_name} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <Utensils className="w-5 h-5 text-neutral-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{log.food_name}</p>
          <p className="text-xs text-neutral-400">{log.quantity}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-orange-400">{formatCalories(log.calories)} kal</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Expanded macros */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex gap-4">
            <MacroChip label="Protein" value={formatMacro(log.protein)} color="text-blue-400" />
            <MacroChip label="Karbo" value={formatMacro(log.carbs)} color="text-yellow-400" />
            <MacroChip label="Lemak" value={formatMacro(log.fat)} color="text-rose-400" />
            <MacroChip label="Serat" value={formatMacro(log.fiber)} color="text-emerald-400" />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function MacroChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
      <span className="text-[10px] text-neutral-500">{label}</span>
    </div>
  )
}
