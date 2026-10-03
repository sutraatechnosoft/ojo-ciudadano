// Solo se usa en el navegador. Reduce la foto antes de enviarla:
//  - máx. 1600 px de lado mayor, JPEG calidad 0.8 (~300-600 KB)
//  - al volver a codificar en canvas se eliminan los metadatos EXIF (incluida la ubicación GPS del móvil)
export const MAX_BYTES_CLIENTE = 4 * 1024 * 1024

type Cargada = { source: CanvasImageSource; width: number; height: number; cerrar: () => void }

async function cargar(file: File): Promise<Cargada> {
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

export async function comprimirImagen(file: File, maxLado = 1600, calidad = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const img = await cargar(file)
  try {
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * escala))
    const h = Math.max(1, Math.round(img.height * escala))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.fillStyle = '#fff' // PNG con transparencia: evita fondo negro al pasar a JPEG
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img.source, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', calidad))
    if (!blob) return file

    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } finally {
    img.cerrar()
  }
}
