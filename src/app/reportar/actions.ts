'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { leerPunto } from '@/lib/schemas'
import { hashIp, verificarCaptcha } from '@/lib/captcha'
import { BUCKET, EXT_POR_MIME, MAX_FILE_BYTES, MIME_POR_EXT, matchesMagicBytes } from '@/lib/imagenes'
import { emitirTicket, leerTicket } from '@/lib/ticket'
import type { FormState, SubidaState } from '@/lib/types'

const MAX_REPORTES_POR_HORA = 5
const RE_RUTA = /^reportes\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/

// PASO 1 (el navegador envía solo texto, sin la foto): valida todo y devuelve una URL firmada
// para subir la foto directo a Supabase Storage. Aquí van el captcha y el límite por IP.
export async function solicitarSubida(formData: FormData): Promise<SubidaState> {
  if (String(formData.get('sitio_web') ?? '').trim() !== '') return { error: 'No se pudo procesar la solicitud.' }

  const parsed = leerPunto(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const ext = EXT_POR_MIME[String(formData.get('mime') ?? '')]
  if (!ext) return { error: 'Formato no permitido. Usa JPG, PNG o WebP.' }
  const tamano = Number(formData.get('tamano'))
  if (!Number.isFinite(tamano) || tamano <= 0 || tamano > MAX_FILE_BYTES)
    return { error: 'La imagen supera el máximo de 5 MB.' }

  const errCaptcha = await verificarCaptcha(formData)
  if (errCaptcha) return { error: errCaptcha }

  const supabase = createAdminClient()

  // OWASP A04: límite por IP (solo se guarda un hash con sal). Falla cerrado: si no se puede
  // comprobar o registrar el límite, se rechaza la solicitud.
  const ipHash = await hashIp('reporte')
  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: errLimite } = await supabase
    .from('reportes_limite')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', desde)
  if (errLimite) {
    console.error('Error al consultar el límite por IP:', errLimite.message)
    return { error: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' }
  }
  if ((count ?? 0) >= MAX_REPORTES_POR_HORA)
    return { error: 'Alcanzaste el límite de reportes por hora. Inténtalo más tarde.' }

  const { error: errRegistro } = await supabase.from('reportes_limite').insert({ ip_hash: ipHash })
  if (errRegistro) {
    console.error('Error al registrar el límite por IP:', errRegistro.message)
    return { error: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' }
  }

  // La ruta la elige el servidor (UUID): el cliente no puede escribir en otra ubicación.
  const path = `reportes/${crypto.randomUUID()}.${ext}`
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    console.error('Error al crear la URL de subida:', error?.message)
    return { error: 'No se pudo preparar la subida de la foto. Inténtalo de nuevo.' }
  }

  return { path, token: data.token, ticket: emitirTicket(path) }
}

// PASO 2: la foto ya está en Storage. Se comprueba que realmente exista y sea una imagen válida
// y se guarda el reporte. Sin ticket válido no se puede crear nada.
export async function crearReporte(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get('sitio_web') ?? '').trim() !== '') return { ok: true }

  const parsed = leerPunto(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const path = leerTicket(String(formData.get('ticket') ?? ''))
  if (!path || !RE_RUTA.test(path)) return { error: 'La sesión de subida expiró. Envía el reporte de nuevo.' }

  const supabase = createAdminClient()
  const storage = supabase.storage.from(BUCKET)

  const { data: blob, error: errDescarga } = await storage.download(path)
  if (errDescarga || !blob) return { error: 'No encontramos la foto subida. Inténtalo de nuevo.' }

  // El bucket ya limita tamaño y MIME; aquí se verifica el contenido real (firma del archivo).
  const mime = MIME_POR_EXT[path.split('.').pop() ?? '']
  const cabecera = new Uint8Array(await blob.slice(0, 12).arrayBuffer())
  if (blob.size > MAX_FILE_BYTES || !mime || !matchesMagicBytes(cabecera, mime)) {
    await storage.remove([path])
    return { error: 'El contenido del archivo no corresponde a una imagen válida.' }
  }

  const url = storage.getPublicUrl(path).data.publicUrl

  // Un ticket sirve para un solo reporte.
  const { count } = await supabase.from('puntos').select('id', { count: 'exact', head: true }).eq('imagen_url', url)
  if ((count ?? 0) > 0) return { error: 'Esa foto ya se usó en otro reporte.' }

  // Siempre entra como "pendiente": solo un admin puede verificarlo.
  const { error } = await supabase.from('puntos').insert({ ...parsed.data, imagen_url: url, estado: 'pendiente' })
  if (error) {
    console.error('Error al guardar el reporte:', error.code, error.message)
    await storage.remove([path])
    return { error: 'No se pudo guardar el reporte. Inténtalo de nuevo.' }
  }

  return { ok: true }
}
