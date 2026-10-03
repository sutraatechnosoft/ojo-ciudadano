'use client'

import { useActionState } from 'react'
import type { FormState } from '@/lib/types'

export default function TwoFactorForm({
  action,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-slate-700">
          Código de 6 dígitos
        </label>
        <input
          id="codigo" name="codigo" required autoFocus inputMode="numeric" pattern="[0-9 ]{6,7}"
          maxLength={7} autoComplete="one-time-code" placeholder="123456"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-xl tracking-[0.4em] focus:outline-2 focus:outline-blue-600"
        />
      </div>
      <button
        type="submit" disabled={pending}
        className="w-full rounded-md bg-slate-900 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? 'Verificando…' : submitLabel}
      </button>
    </form>
  )
}
