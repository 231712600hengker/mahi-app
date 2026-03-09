import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString()
}

export function formatMacro(g: number): string {
  return `${Math.round(g)}g`
}

export function getProgressColor(percentage: number): string {
  if (percentage < 70) return 'text-emerald-400'
  if (percentage < 90) return 'text-amber-400'
  if (percentage <= 100) return 'text-orange-400'
  return 'text-rose-400'
}

export function getProgressRingColor(percentage: number): string {
  if (percentage < 70) return '#34d399' // emerald-400
  if (percentage < 90) return '#fbbf24' // amber-400
  if (percentage <= 100) return '#fb923c' // orange-400
  return '#f43f5e' // rose-500
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}
