'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { contactoSchema } from '@/lib/schemas'
import { hashIp, verificarCaptcha } from '@/lib/captcha'
import type { FormState } from '@/lib/types'

const MAX_MENSAJES_POR_HORA = 5

export async function enviarContacto(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: si un bot lo llena, fingimos éxito sin guardar nada.
  if (String(formData.get('sitio_web') ?? '').trim() !== '') return { ok: true }

  const parsed = contactoSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    mensaje: formData.get('mensaje'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const errCaptcha = await verificarCaptcha(formData)
  if (errCaptcha) return { error: errCaptcha }

  const supabase = createAdminClient()
  const ipHash = await hashIp('contacto')

  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('reportes_limite')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', desde)
  if ((count ?? 0) >= MAX_MENSAJES_POR_HORA)
    return { error: 'Alcanzaste el límite de mensajes por hora. Inténtalo más tarde.' }
  await supabase.from('reportes_limite').insert({ ip_hash: ipHash })

  const { error } = await supabase.from('contactos').insert(parsed.data)
  if (error) {
    console.error('Error al guardar el contacto:', error.code, error.message)
    return { error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' }
  }

  return { ok: true }
}
