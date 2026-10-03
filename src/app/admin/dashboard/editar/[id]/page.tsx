import { notFound } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import PuntoForm from '@/components/PuntoForm'
import { updatePunto } from '../../actions'
import type { Punto } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditarPuntoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('puntos').select('*').eq('id', id).single()
  if (!data) notFound()

  const punto = { ...data, latitud: Number(data.latitud), longitud: Number(data.longitud) } as Punto

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar punto</h1>
        <PuntoForm action={updatePunto.bind(null, id)} punto={punto} submitLabel="Guardar cambios" />
      </div>
    </main>
  )
}
