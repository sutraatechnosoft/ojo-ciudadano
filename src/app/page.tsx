import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MapLoader from '@/components/MapLoader'
import { CATEGORIAS } from '@/lib/categorias'
import CategoriaIcon from '@/components/CategoriaIcon'
import type { PuntoMapa } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  // Filtro explícito: aunque haya un admin con sesión, el mapa público solo muestra verificados.
  const { data, error } = await supabase
    .from('puntos')
    .select('id, categoria, latitud, longitud, imagen_url, verificado_en, nota_verificacion, foto_verificacion_url')
    .eq('estado', 'verificado')

  if (error) console.error('Error al cargar puntos:', error.message)

  const puntos: PuntoMapa[] = (data ?? []).map((p) => ({
    ...p,
    latitud: Number(p.latitud),
    longitud: Number(p.longitud),
  }))

  return (
    <main className="fixed inset-0 overflow-hidden">
      <MapLoader puntos={puntos} />

      <div className="absolute left-3 top-3 z-[1000] max-w-[16rem] rounded-md bg-white/95 px-4 py-3 shadow">
        <h1 className="m-0 text-lg font-semibold text-slate-900">Ojo Ciudadano</h1>
        <p className="m-0 mt-0.5 text-sm text-slate-600">
          {puntos.length === 0
            ? 'Aún no hay problemas verificados.'
            : `${puntos.length} ${puntos.length === 1 ? 'problema verificado' : 'problemas verificados'} en sitio`}
        </p>
      </div>

      <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2">
        <Link
          href="/reportar"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          Reportar un problema
        </Link>
        <Link
          href="/contacto"
          className="rounded-md bg-white/95 px-3 py-2 text-sm font-medium text-slate-800 shadow hover:bg-white focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          Contacto
        </Link>
      </div>

      <ul className="absolute bottom-6 left-3 z-[1000] m-0 list-none space-y-1 rounded-md bg-white/95 p-3 text-xs text-slate-700 shadow">
        {Object.entries(CATEGORIAS).map(([k, c]) => (
          <li key={k} className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: c.color }}
            >
              <CategoriaIcon categoria={k as keyof typeof CATEGORIAS} size={14} />
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </main>
  )
}
