'use client'

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pinIcon } from '@/lib/leafletIcon'
import { CATEGORIAS } from '@/lib/categorias'
import CategoriaIcon from './CategoriaIcon'
import { MAP_CENTER, MAP_ZOOM } from '@/lib/mapConfig'
import type { PuntoMapa } from '@/lib/types'

export default function MapView({ puntos }: { puntos: PuntoMapa[] }) {
  return (
    <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} zoomControl={false} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      {puntos.map((p) => {
        const cat = CATEGORIAS[p.categoria] ?? CATEGORIAS.otro
        return (
          <Marker key={p.id} position={[p.latitud, p.longitud]} icon={pinIcon(p.categoria)}>
            <Popup minWidth={240} maxWidth={280}>
              <div className="w-60">
                <span
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm font-semibold text-white"
                  style={{ background: cat.color }}
                >
                  <CategoriaIcon categoria={p.categoria} size={16} />
                  {cat.label}
                </span>
                {p.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagen_url}
                    alt={`Foto del reporte: ${cat.label}`}
                    loading="lazy"
                    className="my-2 block h-auto max-h-[45vh] w-full rounded object-contain"
                  />
                )}
                <div className="rounded bg-emerald-50 p-2 text-xs text-emerald-900">
                  <strong>Verificado en sitio</strong>
                  {p.verificado_en && <> el {new Date(p.verificado_en).toLocaleDateString('es', { dateStyle: 'medium' })}</>}
                  {p.nota_verificacion && <p className="mt-1 mb-0">{p.nota_verificacion}</p>}
                  {p.foto_verificacion_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.foto_verificacion_url}
                      alt="Foto de la verificación"
                      loading="lazy"
                      className="mt-2 block h-auto max-h-[35vh] w-full rounded object-contain"
                    />
                  )}
                </div>
                <p className="mt-2 mb-0 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{p.latitud.toFixed(5)}, {p.longitud.toFixed(5)}</span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${p.latitud}&mlon=${p.longitud}#map=18/${p.latitud}/${p.longitud}`}
                    target="_blank" rel="noopener noreferrer" className="text-blue-700 underline"
                  >
                    Ver en OSM
                  </a>
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}