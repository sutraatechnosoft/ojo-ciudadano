import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import icon2x from 'leaflet/dist/images/marker-icon-2x.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

// Iconos servidos localmente (sin depender de CDNs externos, compatible con la CSP).
export const defaultIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: icon2x.src,
  shadowUrl: shadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Pin de color por categoría (sin imágenes externas).
export function pinIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div class="pin" style="background:${color}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 34],
    popupAnchor: [0, -34],
  })
}
