import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../login/actions'
import TwoFactorForm from './TwoFactorForm'
import { verificarCodigo } from './actions'

export const dynamic = 'force-dynamic'

export default async function DosFactoresPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel === 'aal2') redirect('/admin/dashboard')

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const verificado = factors?.totp?.[0] // `totp` solo incluye factores ya verificados

  let contenido: React.ReactNode

  if (verificado) {
    contenido = (
      <>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Verificación en dos pasos</h1>
        <p className="mb-6 mt-0 text-sm text-slate-600">
          Abre Google Authenticator e ingresa el código de “Ojo Ciudadano”.
        </p>
        <TwoFactorForm action={verificarCodigo.bind(null, verificado.id)} submitLabel="Verificar" />
      </>
    )
  } else {
    // Primer ingreso: se descartan intentos de enrolamiento sin terminar y se crea un factor nuevo.
    for (const f of factors?.all ?? []) {
      if (f.factor_type === 'totp' && f.status === 'unverified') {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Ojo Ciudadano',
      friendlyName: `Authenticator-${crypto.randomUUID().slice(0, 8)}`,
    })

    contenido =
      error || !data ? (
        <p role="alert" className="text-sm text-red-800">
          No se pudo iniciar la configuración del 2FA. Verifica que TOTP esté habilitado en Supabase
          (Authentication → Sign In / Providers → Multi-Factor) y recarga la página.
        </p>
      ) : (
        <>
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Configura tu verificación en dos pasos</h1>
          <p className="mb-4 mt-0 text-sm text-slate-600">
            1. Abre <strong>Google Authenticator</strong> y escanea este código QR.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.totp.qr_code} alt="Código QR para Google Authenticator" className="mx-auto h-48 w-48" />
          <p className="mb-1 mt-3 text-center text-xs text-slate-500">¿No puedes escanear? Ingresa esta clave:</p>
          <p className="m-0 break-all rounded bg-slate-100 p-2 text-center font-mono text-xs text-slate-800">
            {data.totp.secret}
          </p>
          <p className="mb-4 mt-4 text-sm text-slate-600">2. Ingresa el código de 6 dígitos que muestra la app.</p>
          <TwoFactorForm action={verificarCodigo.bind(null, data.id)} submitLabel="Activar y entrar" />
        </>
      )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        {contenido}
        <form action={logout} className="mt-6 text-center">
          <button type="submit" className="text-sm text-slate-600 hover:underline">
            Cancelar y cerrar sesión
          </button>
        </form>
      </div>
    </main>
  )
}
