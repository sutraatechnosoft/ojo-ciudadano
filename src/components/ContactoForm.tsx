'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Captcha from './Captcha'
import { enviarContacto } from '@/app/contacto/actions'
import type { FormState } from '@/lib/types'

const inputCls = 'w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600'

export default function ContactoForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(enviarContacto, {})

  if (state.ok) {
    return (
      <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <h2 className="m-0 text-lg font-semibold">Mensaje enviado</h2>
        <p className="mt-2 text-sm">Gracias por escribirnos. Revisaremos tu mensaje a la brevedad.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium underline">Volver al mapa</Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Sitio web
          <input name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
        <input id="nombre" name="nombre" required maxLength={100} autoComplete="name" className={inputCls} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className={inputCls} />
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1 block text-sm font-medium text-slate-700">Mensaje</label>
        <textarea id="mensaje" name="mensaje" rows={5} required maxLength={2000} className={inputCls} />
      </div>

      <Captcha resetKey={state} />

      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? 'Enviando…' : 'Enviar mensaje'}
        </button>
        <Link href="/" className="text-sm text-slate-600 hover:underline">Cancelar</Link>
      </div>
    </form>
  )
}
