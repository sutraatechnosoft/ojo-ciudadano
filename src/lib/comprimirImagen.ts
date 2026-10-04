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
      const intentos: [number, number][] = [[w, h], [h, w]]
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