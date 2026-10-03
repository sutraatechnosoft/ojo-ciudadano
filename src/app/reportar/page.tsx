import Link from 'next/link'
import PuntoForm from '@/components/PuntoForm'
import { crearReporte, solicitarSubida } from './actions'

export default function ReportarPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 px-1 py-2 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white px-3 py-4 shadow sm:p-6">
        <Link href="/" className="text-base text-slate-600 hover:underline">← Volver al mapa</Link>
        <h1 className="mb-2 mt-3 text-2xl font-semibold text-slate-900">Reporte de Incidencia</h1>
        <p className="mb-6 text-base text-slate-600">
          Tu reporte no se publica de inmediato: un verificador revisará la foto
          y solo entonces aparecerá en el mapa.
        </p>
        <PuntoForm action={crearReporte} subir={solicitarSubida} submitLabel="Enviar reporte" publico />
      </div>
    </main>
  )
}