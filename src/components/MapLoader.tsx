'use client'

import dynamic from 'next/dynamic'
import type { PuntoMapa } from '@/lib/types'

// Leaflet usa `window`: se carga solo en el cliente.
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-600">
      Cargando mapa…
    </div>
  ),
})

export default function MapLoader({ puntos }: { puntos: PuntoMapa[] }) {
  return <MapView puntos={puntos} />
}
