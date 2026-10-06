import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ojo Ciudadano',
  description: 'Mapa ciudadano de huecos, obras inconclusas y otros problemas, verificados en sitio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
      <Footer />
    </html>
  )
}
