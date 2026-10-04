import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Ticket firmado (HMAC) que prueba que el captcha, el límite por IP y las validaciones ya pasaron
// al pedir la URL de subida. Evita reutilizar el token de Turnstile (sirve una sola vez) y impide
// que el cliente invente rutas: la ruta va dentro del ticket y no se puede alterar.
const TTL_MS = 15 * 60 * 1000

function firma(data: string) {
  const key = process.env.TICKET_SECRET
  if (!key) throw new Error('Falta TICKET_SECRET')
  return createHmac('sha256', key).update(data).digest('base64url')
}

export function emitirTicket(path: string) {
  const data = `${path}|${Date.now() + TTL_MS}`
  return `${Buffer.from(data).toString('base64url')}.${firma(data)}`
}

// Devuelve la ruta si el ticket es auténtico y no ha vencido; si no, null.
export function leerTicket(ticket: string): string | null {
  const [b64, sig] = ticket.split('.')
  if (!b64 || !sig) return null
  const data = Buffer.from(b64, 'base64url').toString()
  const esperada = Buffer.from(firma(data))
  const recibida = Buffer.from(sig)
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null
  const [path, exp] = data.split('|')
  if (!path || !(Number(exp) > Date.now())) return null
  return path
}
