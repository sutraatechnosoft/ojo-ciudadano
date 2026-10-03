'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { leerPunto } from '@/lib/schemas'
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

  const supabase = createAdminClient()

  // OWASP A04: límite de reportes por IP (se guarda solo un hash con sal, no la IP).
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'desconocida'
  const ipHash = createHash('sha256')
    .update(`${process.env.RATE_LIMIT_SALT ?? 'ojo-ciudadano'}:${ip}`)
    .digest('hex')

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
    descripcion: parsed.data.descripcion || null,
    imagen_url: img.url,
    estado: 'pendiente',
  })
  if (error) return { error: 'No se pudo guardar el reporte. Inténtalo de nuevo.' }

  return { ok: true }
}
