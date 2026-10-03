'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { defaultIcon } from '@/lib/leafletIcon'
import { MAP_CENTER, MAP_ZOOM } from '@/lib/mapConfig'

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)))
    },
  })
  return null
}

// Recentra el mapa cuando el punto cambia desde fuera (GPS o coordenadas escritas).
function Recenter({ lat, lon }: { lat: number | null; lon: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (lat === null || lon === null) return
    if (!map.getBounds().contains([lat, lon]) || map.getZoom() < 12) {
      map.setView([lat, lon], Math.max(map.getZoom(), 15))
    }
  }, [lat, lon, map])
  return null
}

export default function LocationPicker({
  lat,
  lon,
  onPick,
}: {
  lat: number | null
  lon: number | null
  onPick: (lat: number, lon: number) => void
}) {
  const hasPoint = lat !== null && lon !== null
  return (
    <MapContainer
      center={hasPoint ? [lat, lon] : MAP_CENTER}
      zoom={hasPoint ? 15 : MAP_ZOOM}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickHandler onPick={onPick} />
      <Recenter lat={lat} lon={lon} />
      {hasPoint && <Marker position={[lat, lon]} icon={defaultIcon} />}
    </MapContainer>
  )
}
