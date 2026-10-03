'use client'

import { useEffect, useRef } from 'react'

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id?: string) => void
}
declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

// Cloudflare Turnstile. Inserta el campo oculto `cf-turnstile-response` dentro del formulario.
// `resetKey`: al cambiar (p. ej. tras un envío con error) se pide un token nuevo, porque cada token sirve una vez.
export default function Captcha({ resetKey }: { resetKey?: unknown }) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | undefined>(undefined)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false
    const mount = () => {
      if (cancelled || widgetId.current || !ref.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(ref.current, { sitekey: siteKey, language: 'es' })
    }
    if (window.turnstile) {
      mount()
    } else {
      let s = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
      if (!s) {
        s = document.createElement('script')
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        s.async = true
        s.dataset.turnstile = '1'
        document.head.appendChild(s)
      }
      s.addEventListener('load', mount)
    }
    return () => {
      cancelled = true
      if (widgetId.current) window.turnstile?.remove(widgetId.current)
      widgetId.current = undefined
    }
  }, [siteKey])

  useEffect(() => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current)
  }, [resetKey])

  if (!siteKey) {
    return <p className="m-0 text-sm text-red-700">Captcha no configurado (falta NEXT_PUBLIC_TURNSTILE_SITE_KEY).</p>
  }
  return <div ref={ref} />
}
