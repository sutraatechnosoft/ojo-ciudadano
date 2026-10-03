import Link from 'next/link'
import LoginForm from './LoginForm'

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Ojo Ciudadano · Verificadores</h1>
        <LoginForm />
        <Link href="/" className="mt-6 block text-center text-sm text-slate-600 hover:underline">
          Volver al mapa
        </Link>
      </div>
    </main>
  )
}
