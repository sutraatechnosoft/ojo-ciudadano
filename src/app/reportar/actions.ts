'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { leerPunto } from '@/lib/schemas'
import { hashIp, verificarCaptcha } from '@/lib/captcha'
import { archivoDeForm, subirImagen } from '@/lib/imagenes'
import type { FormState } from '@/lib/types'

const MAX_REPORTES_POR_HORA = 5

export async function crearReporte(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: si un bot lo llena, fingimos éxito sin guardar nada.
  if (String(formData.get('sitio_web') ?? '').trim() !== '') return { ok: true }

  const parsed = leerPunto(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const file = archivoDeForm(formData, 'foto')
  if (!file) return { error: 'Adjunta una foto como evidencia.' }

  const errCaptcha = await verificarCaptcha(formData)
  if (errCaptcha) return { error: errCaptcha }

  const supabase = createAdminClient()

  // OWASP A04: límite de reportes por IP (se guarda solo un hash con sal, no la IP).
  const ipHash = await hashIp('reporte')

  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('reportes_limite')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', desde)
  if ((count ?? 0) >= MAX_REPORTES_POR_HORA)
    return { error: 'Alcanzaste el límite de reportes por hora. Inténtalo más tarde.' }

  await supabase.from('reportes_limite').insert({ ip_hash: ipHash })

  const img = await subirImagen(supabase, file, 'reportes')
  if (img.error) return { error: img.error }

  // Siempre entra como "pendiente": solo un admin puede verificarlo.
  const { error } = await supabase.from('puntos').insert({
    ...parsed.data,
    imagen_url: img.url,
    estado: 'pendiente',
  })
  if (error) {
    console.error('Error al guardar el reporte:', error.code, error.message)
    return { error: 'No se pudo guardar el reporte. Inténtalo de nuevo.' }
  }

  return { ok: true }
}
