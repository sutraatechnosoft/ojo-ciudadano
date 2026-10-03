import Link from 'next/link'
import ContactoForm from '@/components/ContactoForm'

export const metadata = { title: 'Contacto · Ojo Ciudadano' }

export default function ContactoPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <Link href="/" className="text-sm text-slate-600 hover:underline">← Volver al mapa</Link>
        <h1 className="mb-2 mt-3 text-xl font-semibold text-slate-900">Contacto</h1>
        <p className="mb-6 text-sm text-slate-600">Escríbenos y te responderemos por email.</p>
        <ContactoForm />
      </div>
    </main>
  )
}
