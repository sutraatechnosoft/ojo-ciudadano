import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../login/actions'
import DeleteButton from '@/components/DeleteButton'
import { CATEGORIAS } from '@/lib/categorias'
import type { Estado, Punto } from '@/lib/types'

export const dynamic = 'force-dynamic'

const ESTADOS: { key: Estado; label: string; badge: string }[] = [
  { key: 'pendiente', label: 'Por verificar', badge: 'bg-amber-100 text-amber-900' },
  { key: 'verificado', label: 'Verificados', badge: 'bg-emerald-100 text-emerald-900' },
  { key: 'rechazado', label: 'Rechazados', badge: 'bg-slate-200 text-slate-700' },
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const sp = await searchParams
  const filtro: Estado = ESTADOS.some((e) => e.key === sp.estado) ? (sp.estado as Estado) : 'pendiente'

  const supabase = await createClient()
  const { data } = await supabase.from('puntos').select('*').order('created_at', { ascending: false })
  const todos = (data ?? []) as Punto[]
  const cuenta = (e: Estado) => todos.filter((p) => p.estado === e).length
  const puntos = todos.filter((p) => p.estado === filtro)

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Verificación de reportes</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-600 hover:underline">Ver mapa</Link>
            <Link
              href="/admin/dashboard/nuevo"
              className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700"
            >
              Agregar punto
            </Link>
            <form action={logout}>
              <button type="submit" className="text-slate-600 hover:underline">Cerrar sesión</button>
            </form>
          </div>
        </header>

        <nav className="mb-4 flex gap-2" aria-label="Estado">
          {ESTADOS.map((e) => (
            <Link
              key={e.key}
              href={`/admin/dashboard?estado=${e.key}`}
              aria-current={filtro === e.key ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filtro === e.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
              }`}
            >
              {e.label} ({cuenta(e.key)})
            </Link>
          ))}
        </nav>

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 font-medium">Foto</th>
                <th className="p-3 font-medium">Reporte</th>
                <th className="p-3 font-medium">Ubicación</th>
                <th className="p-3 font-medium">Recibido</th>
                <th className="p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {puntos.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">
                    {p.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen_url} alt="" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{p.nombre}</div>
                    <div className="text-xs text-slate-500">{(CATEGORIAS[p.categoria] ?? CATEGORIAS.otro).label}</div>
                  </td>
                  <td className="p-3 text-slate-600">{Number(p.latitud)}, {Number(p.longitud)}</td>
                  <td className="p-3 text-slate-600">
                    {new Date(p.created_at).toLocaleDateString('es', { dateStyle: 'medium' })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/dashboard/revisar/${p.id}`} className="font-medium text-blue-700 hover:underline">
                        Revisar
                      </Link>
                      <Link href={`/admin/dashboard/editar/${p.id}`} className="text-slate-600 hover:underline">
                        Editar
                      </Link>
                      <DeleteButton id={p.id} nombre={p.nombre} />
                    </div>
                  </td>
                </tr>
              ))}
              {puntos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    {filtro === 'pendiente' ? 'No hay reportes por verificar.' : 'No hay reportes en este estado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
