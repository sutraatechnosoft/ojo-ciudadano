export const CATEGORIA_KEYS = ['hueco', 'obra_inconclusa', 'obra_en_ejecucion', 'alumbrado', 'otro'] as const
export type Categoria = (typeof CATEGORIA_KEYS)[number]

// `icon` es el interior de un SVG 24x24 (trazo, estilo Lucide). Contenido estático y de confianza.
export const CATEGORIAS: Record<Categoria, { label: string; color: string; icon: string }> = {
  hueco: {
    label: 'Hueco en la vía',
    color: '#ea580c',
    icon: '<path d="M4 21 8 3"/><path d="M20 21 16 3"/><ellipse cx="12" cy="14" rx="4" ry="2.5"/>',
  },
  obra_inconclusa: {
    label: 'Obra inconclusa',
    color: '#dc2626',
    icon: '<rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/>',
  },
  obra_en_ejecucion: {
    label: 'Obra en ejecución',
    color: '#2563eb',
    icon: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/>',
  },
  alumbrado: {
    label: 'Alumbrado dañado',
    color: '#ca8a04',
    icon: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  },
  otro: {
    label: 'Otro problema',
    color: '#475569',
    icon: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  },
}

export function svgIcono(cat: Categoria, size = 16, color = 'currentColor') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CATEGORIAS[cat].icon}</svg>`
}
