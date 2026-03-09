'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, Image as ImageIcon, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CameraCaptureProps {
  onCapture: (base64: string, mimeType: string) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [streaming, setStreaming] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStreaming(true)
      }
    } catch {
      setError('Tidak dapat mengakses kamera. Gunakan galeri.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const { videoWidth, videoHeight } = videoRef.current
    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight
    canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    stopCamera()
  }, [stopCamera])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (!preview) return
    const base64 = preview.split(',')[1]
    const mimeType = preview.split(';')[0].split(':')[1]
    onCapture(base64, mimeType)
  }

  const reset = () => {
    setPreview(null)
    setStreaming(false)
    startCamera()
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 safe-top">
        <button onClick={() => { stopCamera(); onClose() }} className="p-2 rounded-full bg-black/50 text-white">
          <X className="w-5 h-5" />
        </button>
        <span className="text-white text-sm font-medium">Scan Makanan</span>
        <div className="w-9" />
      </div>

      {/* Preview / Video */}
      <div className="flex-1 relative overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            className={cn('w-full h-full object-cover', !streaming && 'hidden')}
            playsInline
            muted
          />
        )}

        {!streaming && !preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center">
              <Camera className="w-10 h-10 text-neutral-500" />
            </div>
            {error && <p className="text-rose-400 text-sm text-center px-8">{error}</p>}
            <button onClick={startCamera} className="btn-primary px-8 py-3">
              <Camera className="w-5 h-5" />
              Buka Kamera
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Bottom controls */}
      <div className="p-6 flex items-center justify-center gap-8 safe-bottom">
        {preview ? (
          <>
            <button onClick={reset} className="btn-secondary px-6 py-3">
              <RotateCcw className="w-4 h-4" />
              Ulangi
            </button>
            <button onClick={handleConfirm} className="btn-primary px-8 py-3">
              Gunakan Foto
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-300"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            {streaming && (
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-white" />
              </button>
            )}
            <div className="w-12 h-12" />
          </>
        )}
      </div>
    </div>
  )
}
