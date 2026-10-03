'use client'

import { useActionState } from 'react'
import Captcha from '@/components/Captcha'
import { login, type LoginState } from './actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <form action={action} className="space-y-4" noValidate={false}>
      {state.error && (
        <div role="alert" className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Correo electrónico
        </label>
        <input
          id="email" name="email" type="email" required autoComplete="username" maxLength={254}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Contraseña
        </label>
        <input
          id="password" name="password" type="password" required autoComplete="current-password" maxLength={200}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600"
        />
      </div>
      <Captcha resetKey={state} />
      <button
        type="submit" disabled={pending}
        className="w-full rounded-md bg-slate-900 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? 'Verificando…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
