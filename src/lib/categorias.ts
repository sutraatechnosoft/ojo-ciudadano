export const CATEGORIA_KEYS = ['hueco', 'obra_inconclusa', 'alumbrado', 'otro'] as const
export type Categoria = (typeof CATEGORIA_KEYS)[number]

export const CATEGORIAS: Record<Categoria, { label: string; color: string }> = {
  hueco: { label: 'Hueco en la vía', color: '#ea580c' },
  obra_inconclusa: { label: 'Obra inconclusa', color: '#dc2626' },
  alumbrado: { label: 'Alumbrado dañado', color: '#ca8a04' },
  otro: { label: 'Otro problema', color: '#475569' },
}
