'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { pinIcon } from '@/lib/leafletIcon'
import { CATEGORIAS } from '@/lib/categorias'
import { MAP_CENTER, MAP_ZOOM } from '@/lib/mapConfig'
import type { PuntoMapa } from '@/lib/types'

function FitToPoints({ puntos }: { puntos: PuntoMapa[] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 0) return
    if (puntos.length === 1) {
      map.setView([puntos[0].latitud, puntos[0].longitud], 15)
      return
    }
    map.fitBounds(
      L.latLngBounds(puntos.map((p) => [p.latitud, p.longitud] as [number, number])),
      { padding: [70, 70], maxZoom: 16 }
    )
  }, [puntos, map])
  return null
}

export default function MapView({ puntos }: { puntos: PuntoMapa[] }) {
  return (
    <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} zoomControl style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitToPoints puntos={puntos} />
      {puntos.map((p) => {
        const cat = CATEGORIAS[p.categoria] ?? CATEGORIAS.otro
        return (
          <Marker key={p.id} position={[p.latitud, p.longitud]} icon={pinIcon(cat.color)}>
            <Popup minWidth={220} maxWidth={260}>
              <div className="w-56">
                <span
                  className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
                  style={{ background: cat.color }}
                >
                  {cat.label}
                </span>
                <h3 className="mt-2 mb-1 text-base font-semibold leading-snug">{p.nombre}</h3>
                {p.descripcion && <p className="my-1 text-sm text-slate-700">{p.descripcion}</p>}
                {p.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen_url} alt={p.nombre} loading="lazy" className="my-2 h-36 w-full rounded object-cover" />
                )}
                <div className="rounded bg-emerald-50 p-2 text-xs text-emerald-900">
                  <strong>Verificado en sitio</strong>
                  {p.verificado_en && <> el {new Date(p.verificado_en).toLocaleDateString('es', { dateStyle: 'medium' })}</>}
                  {p.nota_verificacion && <p className="mt-1 mb-0">{p.nota_verificacion}</p>}
                  {p.foto_verificacion_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto_verificacion_url} alt="Foto de la verificación" loading="lazy" className="mt-2 h-28 w-full rounded object-cover" />
                  )}
                </div>
                <p className="mt-2 mb-0 text-xs text-slate-500">
                  {p.latitud.toFixed(5)}, {p.longitud.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
