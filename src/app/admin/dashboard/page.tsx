import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../login/actions'
import DeleteButton from '@/components/DeleteButton'
import { CATEGORIAS } from '@/lib/categorias'
import CategoriaIcon from '@/components/CategoriaIcon'
import type { Estado, Punto } from '@/lib/types'

export const dynamic = 'force-dynamic'

const POR_PAGINA = 50

// Solo las columnas que usa la tabla (no `select('*')`).
type Fila = Pick<Punto, 'id' | 'categoria' | 'latitud' | 'longitud' | 'imagen_url' | 'created_at'>

const ESTADOS: { key: Estado; label: string; badge: string }[] = [
  { key: 'pendiente', label: 'Por verificar', badge: 'bg-amber-100 text-amber-900' },
  { key: 'verificado', label: 'Verificados', badge: 'bg-emerald-100 text-emerald-900' },
  { key: 'rechazado', label: 'Rechazados', badge: 'bg-slate-200 text-slate-700' },
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pagina?: string }>
}) {
  const sp = await searchParams
  const filtro: Estado = ESTADOS.some((e) => e.key === sp.estado) ? (sp.estado as Estado) : 'pendiente'
  const pagina = Math.min(100_000, Math.max(1, Number.parseInt(sp.pagina ?? '1', 10) || 1))
  const desde = (pagina - 1) * POR_PAGINA

  const supabase = await createClient()

  // Tres consultas en paralelo, todas resueltas en la base de datos (sin traer todas las filas):
  //  - la página actual (50 filas, solo columnas necesarias) + el total del estado filtrado
  //  - el conteo de las otras dos pestañas (head: true no descarga filas)
  const otros = ESTADOS.filter((e) => e.key !== filtro)
  const [pag, conteos] = await Promise.all([
    supabase
      .from('puntos')
      .select('id, categoria, latitud, longitud, imagen_url, created_at', { count: 'exact' })
      .eq('estado', filtro)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false }) // desempate: paginación estable si dos filas comparten fecha
      .range(desde, desde + POR_PAGINA - 1),
    Promise.all(
      otros.map((e) => supabase.from('puntos').select('id', { count: 'exact', head: true }).eq('estado', e.key))
    ),
  ])

  if (pag.error) console.error('Error al listar reportes:', pag.error.code, pag.error.message)

  const total = pag.count ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  // Página fuera de rango (p. ej. se borraron filas): vuelve a la última que existe.
  if (pagina > totalPaginas) redirect(`/admin/dashboard?estado=${filtro}&pagina=${totalPaginas}`)

  const puntos = (pag.data ?? []) as Fila[]
  const cuentas: Record<Estado, number> = { pendiente: 0, verificado: 0, rechazado: 0, [filtro]: total }
  otros.forEach((e, i) => (cuentas[e.key] = conteos[i].count ?? 0))
  const cuenta = (e: Estado) => cuentas[e]

  const hrefPagina = (n: number) => `/admin/dashboard?estado=${filtro}${n > 1 ? `&pagina=${n}` : ''}`
  const primero = total === 0 ? 0 : desde + 1
  const ultimo = desde + puntos.length

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

        {pag.error && (
          <div role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            No se pudieron cargar los reportes. Recarga la página.
          </div>
        )}

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
                      <img
                        src={p.imagen_url} alt="" width={48} height={48} loading="lazy" decoding="async"
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
                        style={{ background: (CATEGORIAS[p.categoria] ?? CATEGORIAS.otro).color }}
                      >
                        <CategoriaIcon categoria={p.categoria} size={14} />
                      </span>
                      {(CATEGORIAS[p.categoria] ?? CATEGORIAS.otro).label}
                    </div>
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
                      <DeleteButton id={p.id} nombre={(CATEGORIAS[p.categoria] ?? CATEGORIAS.otro).label} />
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

        {total > 0 && (
          <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Paginación">
            <p className="m-0 text-slate-600">
              Mostrando {primero}–{ultimo} de {total} · Página {pagina} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              {pagina > 1 ? (
                <Link href={hrefPagina(pagina - 1)} className="rounded-md bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-100">
                  ← Anterior
                </Link>
              ) : (
                <span aria-disabled="true" className="rounded-md bg-white px-3 py-1.5 font-medium text-slate-300 shadow-sm">← Anterior</span>
              )}
              {pagina < totalPaginas ? (
                <Link href={hrefPagina(pagina + 1)} className="rounded-md bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-100">
                  Siguiente →
                </Link>
              ) : (
                <span aria-disabled="true" className="rounded-md bg-white px-3 py-1.5 font-medium text-slate-300 shadow-sm">Siguiente →</span>
              )}
            </div>
          </nav>
        )}
      </div>
    </main>
  )
}