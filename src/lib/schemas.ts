import { z } from 'zod'
import { CATEGORIA_KEYS } from './categorias'

// OWASP A03: toda entrada se valida en el servidor.
export const puntoSchema = z.object({
  categoria: z.enum(CATEGORIA_KEYS, { errorMap: () => ({ message: 'Selecciona una categoría.' }) }),
  latitud: z.coerce.number({ invalid_type_error: 'Latitud inválida.' }).min(-90).max(90),
  longitud: z.coerce.number({ invalid_type_error: 'Longitud inválida.' }).min(-180).max(180),
})

export const idSchema = z.string().uuid()

export function leerPunto(formData: FormData) {
  return puntoSchema.safeParse({
    categoria: formData.get('categoria'),
    latitud: formData.get('latitud'),
    longitud: formData.get('longitud'),
  })
}

export const contactoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'El nombre admite máximo 100 caracteres.'),
  email: z.string().trim().email('Ingresa un email válido.').max(254, 'El email es demasiado largo.'),
  mensaje: z.string().trim().min(1, 'El mensaje es obligatorio.').max(2000, 'El mensaje admite máximo 2000 caracteres.'),
})
