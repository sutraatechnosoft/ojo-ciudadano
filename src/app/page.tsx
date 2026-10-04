import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MapLoader from '@/components/MapLoader'
import Leyenda from '@/components/Leyenda'
import type { PuntoMapa } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

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

      <div className="absolute left-3 top-3 z-[1000] flex max-w-[20rem] items-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 pl-2.5 pr-5 shadow-lg sm:max-w-[26rem] sm:gap-4 sm:py-3 sm:pl-3 sm:pr-6">
        {/* mix-blend-multiply: el fondo claro del PNG se funde con el blanco de la tarjeta */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt=""
          width={120}
          height={120}
          className="h-16 w-16 shrink-0 object-contain mix-blend-multiply sm:h-24 sm:w-24"
        />
        <div className="min-w-0">
          <h1 className="m-0 text-lg font-bold leading-tight tracking-tight text-slate-900 sm:text-xl">
            OJO Ciudadano
          </h1>
          <p
            className={`m-0 mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium ${
              puntos.length === 0 ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {puntos.length > 0 && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
            {puntos.length === 0
              ? 'Aún no hay incidencias reportadas.'
              : `${puntos.length} ${puntos.length === 1 ? 'incidencia verificada' : 'incidencias verificadas'}`}
          </p>
        </div>
      </div>

      {/*<div className="absolute right-3 top-3 z-[1000]">
        <Link
          href="/contacto"
          className="rounded-md bg-white/95 px-3 py-2 text-sm font-medium text-slate-800 shadow hover:bg-white focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
        >
          Contacto
        </Link>
      </div>
      */}

      <Link
        href="/reportar"
        aria-label="Reportar un problema"
        className="absolute bottom-10 right-4 z-[1000] flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#E65100] text-white shadow-[0_8px_20px_rgba(0,0,0,0.45)] ring-4 ring-white/90 transition hover:bg-[#BF360C] hover:shadow-[0_10px_26px_rgba(0,0,0,0.55)] active:scale-95 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="text-xs font-semibold leading-tight">Reportar</span>
      </Link>

      <Leyenda />
    </main>
  )
}