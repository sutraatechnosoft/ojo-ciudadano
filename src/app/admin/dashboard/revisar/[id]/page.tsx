import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { idSchema } from '@/lib/schemas'
import { CATEGORIAS } from '@/lib/categorias'
import ReviewForms from '@/components/ReviewForms'
import { rechazarPunto, verificarPunto } from '../../actions'
import type { Punto } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RevisarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!idSchema.safeParse(id).success) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('puntos').select('*').eq('id', id).single()
  if (!data) notFound()
  const p = { ...data, latitud: Number(data.latitud), longitud: Number(data.longitud) } as Punto
  const cat = CATEGORIAS[p.categoria] ?? CATEGORIAS.otro

  const osm = `https://www.openstreetmap.org/?mlat=${p.latitud}&mlon=${p.longitud}#map=18/${p.latitud}/${p.longitud}`

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/admin/dashboard?estado=${p.estado}`} className="text-sm text-slate-600 hover:underline">
          ← Volver al listado
        </Link>

        <section className="rounded-lg bg-white p-6 shadow">
          <p className="m-0 text-xs font-medium text-slate-500">
            {cat.label} · Estado actual: <strong>{p.estado}</strong>
          </p>
          <h1 className="mb-2 mt-1 text-xl font-semibold text-slate-900">{p.nombre}</h1>
          {p.descripcion && <p className="mt-0 text-sm text-slate-700">{p.descripcion}</p>}
          {p.imagen_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imagen_url} alt={p.nombre} className="my-3 max-h-80 w-full rounded object-cover" />
          )}
          <p className="m-0 text-sm text-slate-600">
            Coordenadas: {p.latitud}, {p.longitud} ·{' '}
            <a href={osm} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              Abrir en OpenStreetMap
            </a>
          </p>
          {p.nota_verificacion && (
            <p className="mb-0 mt-3 rounded bg-slate-100 p-3 text-sm text-slate-700">
              <strong>Nota:</strong> {p.nota_verificacion}
            </p>
          )}
          {p.foto_verificacion_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto_verificacion_url} alt="Foto de verificación" className="mt-3 max-h-60 w-full rounded object-cover" />
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <ReviewForms
            id={p.id}
            estado={p.estado}
            verificar={verificarPunto.bind(null, p.id)}
            rechazar={rechazarPunto.bind(null, p.id)}
          />
        </section>
      </div>
    </main>
  )
}
