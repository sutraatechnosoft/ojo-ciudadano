import 'server-only'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'

// Cloudflare Turnstile. Falla cerrado: sin llave secreta o sin token válido, se rechaza.
export async function verificarCaptcha(formData: FormData): Promise<string | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('Falta TURNSTILE_SECRET_KEY')
    return 'El captcha no está configurado. Inténtalo más tarde.'
  }
  const token = String(formData.get('cf-turnstile-response') ?? '')
  if (!token) return 'Completa el captcha para continuar.'

  const body = new URLSearchParams({ secret, response: token })
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim()
  if (ip) body.set('remoteip', ip)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success ? null : 'No se pudo validar el captcha. Inténtalo de nuevo.'
  } catch {
    return 'No se pudo validar el captcha. Inténtalo de nuevo.'
  }
}

// Hash con sal de la IP (no se guarda la IP). `ambito` separa los límites de cada formulario.
export async function hashIp(ambito: string) {
  const salt = process.env.RATE_LIMIT_SALT
  if (!salt) throw new Error('Falta RATE_LIMIT_SALT')

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'desconocida'
  return createHash('sha256')
    .update(`${salt}:${ambito}:${ip}`)
    .digest('hex')
}