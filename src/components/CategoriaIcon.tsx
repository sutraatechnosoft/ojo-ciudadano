import { CATEGORIAS, type Categoria } from '@/lib/categorias'

export default function CategoriaIcon({ categoria, size = 16 }: { categoria: Categoria; size?: number }) {
  const cat = CATEGORIAS[categoria] ?? CATEGORIAS.otro
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: cat.icon }}
    />
  )
}
