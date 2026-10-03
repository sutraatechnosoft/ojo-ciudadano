import PuntoForm from '@/components/PuntoForm'
import { createPunto } from '../actions'

export default function NuevoPuntoPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">Agregar punto</h1>
        <p className="mb-6 text-sm text-slate-600">
          Quedará “Por verificar” hasta que lo confirmes en sitio desde el listado.
        </p>
        <PuntoForm action={createPunto} submitLabel="Guardar punto" />
      </div>
    </main>
  )
}
