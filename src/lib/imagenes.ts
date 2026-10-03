import type { SupabaseClient } from '@supabase/supabase-js'

export const BUCKET = 'puntos-fotos'
export const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
export const EXT_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Verifica la firma real del archivo (no solo el tipo MIME declarado por el cliente).
export function matchesMagicBytes(buf: Uint8Array, mime: string) {
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (mime === 'image/png')
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => buf[i] === b)
  if (mime === 'image/webp')
    return (
      String.fromCharCode(...buf.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...buf.slice(8, 12)) === 'WEBP'
    )
  return false
}

export const MIME_POR_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_POR_MIME).map(([mime, ext]) => [ext, mime])
)

export function archivoDeForm(formData: FormData, key: string): File | null {
  const f = formData.get(key)
  return f instanceof File && f.size > 0 ? f : null
}

// OWASP A08: tipo, tamaño y contenido permitidos. Nombre generado (UUID) para evitar path traversal.
export async function subirImagen(
  supabase: SupabaseClient,
  file: File,
  carpeta: 'puntos' | 'reportes' | 'verificaciones'
): Promise<{ url?: string; error?: string }> {
  const ext = EXT_POR_MIME[file.type]
  if (!ext) return { error: 'Formato no permitido. Usa JPG, PNG o WebP.' }
  if (file.size > MAX_FILE_BYTES) return { error: 'La imagen supera el máximo de 5 MB.' }

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!matchesMagicBytes(bytes, file.type))
    return { error: 'El contenido del archivo no corresponde a una imagen válida.' }

  const path = `${carpeta}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (error) return { error: 'No se pudo subir la imagen.' }

  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}

export function rutaDesdeUrl(url: string | null) {
  if (!url) return null
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}
