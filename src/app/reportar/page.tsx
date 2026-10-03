import Link from 'next/link'
import PuntoForm from '@/components/PuntoForm'
import { crearReporte } from './actions'

export default function ReportarPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <Link href="/" className="text-sm text-slate-600 hover:underline">← Volver al mapa</Link>
        <h1 className="mb-2 mt-3 text-xl font-semibold text-slate-900">Reportar un problema</h1>
        <p className="mb-6 text-sm text-slate-600">
          Tu reporte no se publica de inmediato: un verificador irá al sitio para confirmar que el problema existe
          y solo entonces aparecerá en el mapa.
        </p>
        <PuntoForm action={crearReporte} submitLabel="Enviar reporte" publico />
      </div>
    </main>
  )
}
