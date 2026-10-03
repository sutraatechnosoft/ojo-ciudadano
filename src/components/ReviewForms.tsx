'use client'

import { useActionState } from 'react'
import { reabrirPunto } from '@/app/admin/dashboard/actions'
import { comprimirImagen } from '@/lib/comprimirImagen'
import type { FormState, Estado } from '@/lib/types'

type A = (prev: FormState, formData: FormData) => Promise<FormState>
const inputCls = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-blue-600'

function ErrorBox({ msg }: { msg?: string }) {
  return msg ? (
    <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{msg}</div>
  ) : null
}

export default function ReviewForms({
  id,
  estado,
  verificar,
  rechazar,
}: {
  id: string
  estado: Estado
  verificar: A
  rechazar: A
}) {
  const verificarConFoto: A = async (prev, formData) => {
    const f = formData.get('foto_verificacion')
    if (f instanceof File && f.size > 0) {
      try {
        formData.set('foto_verificacion', await comprimirImagen(f))
      } catch {
        return { error: 'No se pudo procesar la imagen. Usa una foto JPG, PNG o WebP.' }
      }
    }
    return verificar(prev, formData)
  }
  const [vState, vAction, vPending] = useActionState<FormState, FormData>(verificarConFoto, {})
  const [rState, rAction, rPending] = useActionState<FormState, FormData>(rechazar, {})

  return (
    <div className="space-y-6">
      {estado !== 'pendiente' && (
        <form action={reabrirPunto} className="rounded-md border border-slate-200 p-4">
          <input type="hidden" name="id" value={id} />
          <p className="mb-3 mt-0 text-sm text-slate-600">
            Devolver a “Por verificar” retira el punto del mapa público.
          </p>
          <button type="submit" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100">
            Devolver a pendiente
          </button>
        </form>
      )}

      {estado !== 'verificado' && (
        <form action={vAction} className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50/40 p-4">
          <h2 className="m-0 text-base font-semibold text-slate-900">Verificar en sitio</h2>
          <ErrorBox msg={vState.error} />
          <label className="flex items-start gap-2 text-sm text-slate-800">
            <input type="checkbox" name="confirmo" required className="mt-1" />
            <span>Visité el lugar y comprobé que el problema existe.</span>
          </label>
          <div>
            <label htmlFor="nota" className="mb-1 block text-sm font-medium text-slate-700">
              Qué encontraste <span className="font-normal text-slate-500">(opcional, se muestra en el mapa)</span>
            </label>
            <textarea id="nota" name="nota" rows={3} maxLength={500} className={inputCls} />
          </div>
          <div>
            <label htmlFor="foto_verificacion" className="mb-1 block text-sm font-medium text-slate-700">
              Foto tomada en el sitio <span className="font-normal text-slate-500">(opcional, JPG/PNG/WebP, máx. 5 MB)</span>
            </label>
            <input
              id="foto_verificacion" name="foto_verificacion" type="file" accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium hover:file:bg-slate-200"
            />
          </div>
          <button
            type="submit" disabled={vPending}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {vPending ? 'Guardando…' : 'Marcar como verificado'}
          </button>
        </form>
      )}

      {estado !== 'rechazado' && (
        <form action={rAction} className="space-y-3 rounded-md border border-slate-200 p-4">
          <h2 className="m-0 text-base font-semibold text-slate-900">Rechazar</h2>
          <ErrorBox msg={rState.error} />
          <div>
            <label htmlFor="motivo" className="mb-1 block text-sm font-medium text-slate-700">
              Motivo (no existe, duplicado, ubicación incorrecta…)
            </label>
            <textarea id="motivo" name="motivo" rows={2} maxLength={500} required className={inputCls} />
          </div>
          <button
            type="submit" disabled={rPending}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {rPending ? 'Guardando…' : 'Rechazar reporte'}
          </button>
        </form>
      )}
    </div>
  )
}
