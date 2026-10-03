import { z } from 'zod'
import { CATEGORIA_KEYS } from './categorias'

// OWASP A03: toda entrada se valida en el servidor.
export const puntoSchema = z.object({
  categoria: z.enum(CATEGORIA_KEYS, { errorMap: () => ({ message: 'Selecciona una categoría.' }) }),
  nombre: z.string().trim().min(1, 'El título es obligatorio.').max(120, 'El título admite máximo 120 caracteres.'),
  descripcion: z.string().trim().max(1000, 'La descripción admite máximo 1000 caracteres.'),
  latitud: z.coerce.number({ invalid_type_error: 'Latitud inválida.' }).min(-90).max(90),
  longitud: z.coerce.number({ invalid_type_error: 'Longitud inválida.' }).min(-180).max(180),
})

export const idSchema = z.string().uuid()

export function leerPunto(formData: FormData) {
  return puntoSchema.safeParse({
    categoria: formData.get('categoria'),
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion') ?? '',
    latitud: formData.get('latitud'),
    longitud: formData.get('longitud'),
  })
}
