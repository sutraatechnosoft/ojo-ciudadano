import L from 'leaflet'
import { CATEGORIAS, svgIcono, type Categoria } from './categorias'
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

// Pin de color con el icono de la categoría (sin imágenes externas).
export function pinIcon(categoria: Categoria) {
  const cat = CATEGORIAS[categoria] ?? CATEGORIAS.otro
  return L.divIcon({
    className: '',
    html: `<div class="pin" style="background:${cat.color}">${svgIcono(categoria, 18, '#fff')}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42],
  })
}
