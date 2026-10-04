'use client'

import { useRef } from 'react'
import type { Popup as LeafletPopup } from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pinIcon } from '@/lib/leafletIcon'
import { CATEGORIAS } from '@/lib/categorias'
import CategoriaIcon from './CategoriaIcon'
import { MAP_CENTER, MAP_ZOOM } from '@/lib/mapConfig'
import type { PuntoMapa } from '@/lib/types'

export default function MapView({ puntos }: { puntos: PuntoMapa[] }) {
  // Un popup por punto: se guarda para recalcular su posición cuando termina de cargar la foto.
  const popups = useRef(new Map<PuntoMapa['id'], LeafletPopup>())

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
            <Popup
              ref={(r) => {
                if (r) popups.current.set(p.id, r)
              }}
              minWidth={200}
              maxWidth={300}
              autoPan
              autoPanPaddingTopLeft={[16, 140]}
              autoPanPaddingBottomRight={[16, 24]}
            >
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
                    onLoad={() => popups.current.get(p.id)?.update()}
                    className="my-1.5 block h-auto max-h-[55vh] w-full rounded object-contain sm:my-2 sm:max-h-[45vh]"
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
                      onLoad={() => popups.current.get(p.id)?.update()}
                      className="mt-1.5 block h-auto max-h-[40vh] w-full rounded object-contain sm:mt-2 sm:max-h-[35vh]"
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