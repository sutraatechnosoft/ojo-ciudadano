export const MAX_BYTES_CLIENTE = 4 * 1024 * 1024

type Cargada = { source: CanvasImageSource; width: number; height: number; cerrar: () => void }

// Lee solo el ancho y alto de la foto, sin decodificarla completa en memoria.
function dimensiones(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const fin = (r: { width: number; height: number } | null) => {
      img.onload = null
      img.onerror = null
      img.src = ''
      URL.revokeObjectURL(url)
      resolve(r)
    }
    img.onload = () =>
      fin(img.naturalWidth && img.naturalHeight ? { width: img.naturalWidth, height: img.naturalHeight } : null)
    img.onerror = () => fin(null)
    img.src = url
  })
}

async function cargar(file: File, maxLado: number): Promise<Cargada> {
  // 1) Preferido: decodificar directamente al tamaño final. Una foto de 48 MP nunca
  //    se carga completa (serían ~190 MB de RAM), que es lo que agota la memoria en móviles.
  const dim = await dimensiones(file)
  if (dim) {
    const escala = Math.min(1, maxLado / Math.max(dim.width, dim.height))
    if (escala < 1) {
      const w = Math.max(1, Math.round(dim.width * escala))
      const h = Math.max(1, Math.round(dim.height * escala))
      // Algunos navegadores aplican el tamaño antes de rotar según EXIF y otros después.
      // Se prueba en el orden normal y, si la imagen sale girada, con ancho y alto invertidos.
      const intentos: [number, number][] = [
        [w, h],
        [h, w],
      ]
      for (const [rw, rh] of intentos) {
        try {
          const bmp = await createImageBitmap(file, {
            resizeWidth: rw,
            resizeHeight: rh,
            resizeQuality: 'medium',
            imageOrientation: 'from-image',
          })
          if (bmp.width === w && bmp.height === h) {
            return { source: bmp, width: bmp.width, height: bmp.height, cerrar: () => bmp.close() }
          }
          bmp.close()
        } catch (e) {
          // Foto enorme: no caer a la decodificación completa, que es la que agota la memoria.
          if (dim.width * dim.height > 12_000_000) throw e
          break
        }
      }
    }
  }

  // 2) Alternativa: decodificar completa (fotos pequeñas o navegadores antiguos)
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return { source: bmp, width: bmp.width, height: bmp.height, cerrar: () => bmp.close() }
  } catch {
    // Navegadores sin soporte de las opciones de createImageBitmap
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    await img.decode()
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, cerrar: () => URL.revokeObjectURL(url) }
  }
}

async function comprimirUna(file: File, maxLado: number, calidad: number): Promise<File> {
  const img = await cargar(file, maxLado)
  const canvas = document.createElement('canvas')
  try {
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * escala))
    const h = Math.max(1, Math.round(img.height * escala))

    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas no disponible')
    ctx.fillStyle = '#fff' // PNG con transparencia: evita fondo negro al pasar a JPEG
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img.source, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', calidad))
    if (!blob) throw new Error('no se pudo generar la imagen')

    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } finally {
    img.cerrar()
    // Libera la memoria del canvas de inmediato
    canvas.width = 0
    canvas.height = 0
  }
}

export async function comprimirImagen(file: File, maxLado = 1600, calidad = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  // Si falla (típicamente por falta de memoria), reintenta con tamaños menores
  // antes de mostrarle un error al usuario.
  const lados = [maxLado, Math.round(maxLado * 0.75), Math.round(maxLado * 0.5)]
  let ultimoError: unknown
  for (const lado of lados) {
    try {
      return await comprimirUna(file, lado, calidad)
    } catch (e) {
      ultimoError = e
      await new Promise((r) => setTimeout(r, 150))
    }
  }
  throw ultimoError
}