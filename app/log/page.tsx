'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getToday } from '@/lib/utils'
import { RecognizeResult, NutritionData } from '@/types'
import CameraCapture from '@/components/CameraCapture'
import {
  Camera, Loader2, ChevronLeft, Check,
  Flame, Beef, Wheat, Droplets, Leaf
} from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'camera' | 'recognizing' | 'confirm' | 'saving'

export default function LogPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState('')
  const [imageMime, setImageMime] = useState('image/jpeg')
  const [recognize, setRecognize] = useState<RecognizeResult | null>(null)
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [editFood, setEditFood] = useState('')
  const [editQty, setEditQty] = useState('')

  const handleCapture = useCallback(async (base64: string, mime: string) => {
    setImageBase64(base64)
    setImageMime(mime)
    setCapturedImage(`data:${mime};base64,${base64}`)
    setStep('recognizing')

    try {
      // AI recognition (returns food name, quantity, and nutrition directly!)
      const recRes = await fetch('/api/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
      })
      const recData: RecognizeResult = await recRes.json()
      
      setRecognize(recData)
      setEditFood(recData.food_name)
      setEditQty(recData.estimated_quantity)
      setNutrition(recData.nutrition) // Use Gemini's nutrition directly
      
      setStep('confirm')
    } catch {
      toast.error('Gagal mengenali makanan')
      setStep('camera')
    }
  }, [])

  // No longer refetching because Gemini estimates from the photo directly.

  const handleSave = async () => {
    if (!nutrition || !editFood) return
    setStep('saving')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    let imageUrl: string | null = null

    // Upload image to Supabase Storage
    try {
      const byteString = atob(imageBase64)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
      const blob = new Blob([ab], { type: imageMime })
      const fileName = `${user.id}/${Date.now()}.jpg`
      const { data: uploadData } = await supabase.storage.from('food-images').upload(fileName, blob)
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('food-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }
    } catch { /* Storage optional — continue without image */ }

    const { error } = await supabase.from('food_logs').insert({
      user_id: user.id,
      date: getToday(),
      food_name: editFood,
      quantity: editQty,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      image_url: imageUrl,
    })

    if (error) {
      toast.error('Gagal menyimpan')
      setStep('confirm')
    } else {
      toast.success('Makanan berhasil dicatat! 🎉')
      router.push('/')
    }
  }

  if (step === 'camera') {
    return <CameraCapture onCapture={handleCapture} onClose={() => router.back()} />
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Catat Makanan</h1>
        </div>

        {/* Recognizing state */}
        {step === 'recognizing' && (
          <div className="flex flex-col items-center gap-6 py-16">
            {capturedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedImage} alt="food" className="w-48 h-48 object-cover rounded-2xl" />
            )}
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-white font-medium">Menganalisis makanan...</p>
              <p className="text-neutral-500 text-sm">AI sedang memproses gambar</p>
            </div>
          </div>
        )}

        {/* Confirm state */}
        {step === 'confirm' && recognize && (
          <div className="space-y-4">
            {/* Food Image */}
            {capturedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedImage}
                alt="food"
                className="w-full h-56 object-cover rounded-2xl"
              />
            )}

            {/* Recognition result */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Makanan Terdeteksi</p>
                <span className="text-xs px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded-full">
                  {Math.round(recognize.confidence * 100)}% yakin
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Nama Makanan</label>
                  <input
                    value={editFood}
                    onChange={e => setEditFood(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Nama makanan"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Porsi</label>
                  <div className="flex gap-2">
                    <input
                      value={editQty}
                      onChange={e => setEditQty(e.target.value)}
                      className="input-field text-sm flex-1"
                      placeholder="Contoh: 1 porsi, 200g"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition card */}
            {nutrition ? (
              <div className="card p-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">Informasi Nutrisi</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <NutritionChip icon={<Flame className="w-4 h-4 text-orange-400" />} label="Kalori" value={`${nutrition.calories}`} unit="kal" />
                  <NutritionChip icon={<Beef className="w-4 h-4 text-blue-400" />} label="Protein" value={`${nutrition.protein}g`} unit="g" />
                  <NutritionChip icon={<Wheat className="w-4 h-4 text-yellow-400" />} label="Karbo" value={`${nutrition.carbs}g`} unit="g" />
                  <NutritionChip icon={<Droplets className="w-4 h-4 text-rose-400" />} label="Lemak" value={`${nutrition.fat}g`} unit="g" />
                  <NutritionChip icon={<Leaf className="w-4 h-4 text-emerald-400" />} label="Serat" value={`${nutrition.fiber}g`} unit="g" />
                </div>
              </div>
            ) : (
              <div className="card p-4 flex items-center gap-3 text-yellow-400">
                <span className="text-sm">⚠️ Data nutrisi tidak tersedia. Coba ubah nama makanan dan refresh.</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('camera')}
                className="btn-secondary flex-1"
              >
                <Camera className="w-4 h-4" />
                Foto Ulang
              </button>
              <button
                onClick={handleSave}
                disabled={!nutrition}
                className="btn-primary flex-1"
              >
                <Check className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        )}

        {/* Saving state */}
        {step === 'saving' && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            <p className="text-white font-medium">Menyimpan log makanan...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NutritionChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-neutral-800/50 rounded-xl p-2">
      {icon}
      <span className="text-xs font-bold text-white leading-tight">{value}</span>
      <span className="text-[9px] text-neutral-500">{label}</span>
    </div>
  )
}
