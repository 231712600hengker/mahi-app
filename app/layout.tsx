import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MAHI — Makan Apa Hari Ini?',
  description: 'Catat makananmu, lacak kalori harian dengan AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MAHI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1c1c1e',
              color: '#ffffff',
              border: '1px solid #2c2c2e',
              borderRadius: '14px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#0a0a0a' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0a0a' } },
          }}
        />
      </body>
    </html>
  )
}
