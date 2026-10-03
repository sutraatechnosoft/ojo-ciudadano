import { z } from 'zod'
import { CATEGORIA_KEYS } from './categorias'
import { dentroDeVenezuela, MSG_FUERA_DE_VENEZUELA } from './venezuela'

// OWASP A03: toda entrada se valida en el servidor.
// Coordenadas: solo texto decimal simple (máx. 6 decimales). Rechaza notación científica, hex, espacios, etc.
const coordenada = (nombre: string, min: number, max: number) =>
  z
    .string({ required_error: `${nombre} inválida.`, invalid_type_error: `${nombre} inválida.` })
    .regex(/^-?\d{1,3}(\.\d{1,6})?$/, `${nombre} inválida.`)
    .transform(Number)
    .pipe(z.number().min(min, `${nombre} fuera de rango.`).max(max, `${nombre} fuera de rango.`))

export const puntoSchema = z
  .object({
    categoria: z.enum(CATEGORIA_KEYS, { errorMap: () => ({ message: 'Selecciona una categoría.' }) }),
    latitud: coordenada('Latitud', -90, 90),
    longitud: coordenada('Longitud', -180, 180),
  })
  .refine((p) => dentroDeVenezuela(p.latitud, p.longitud), { message: MSG_FUERA_DE_VENEZUELA, path: ['latitud'] })

export const idSchema = z.string().uuid()

// Un campo repetido en la petición (parameter pollution) se trata como inválido.
const unico = (formData: FormData, k: string) => {
  const v = formData.getAll(k)
  return v.length === 1 ? v[0] : undefined
}

export function leerPunto(formData: FormData) {
  return puntoSchema.safeParse({
    categoria: unico(formData, 'categoria'),
    latitud: unico(formData, 'latitud'),
    longitud: unico(formData, 'longitud'),
  })
}

export const contactoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'El nombre admite máximo 100 caracteres.'),
  email: z.string().trim().email('Ingresa un email válido.').max(254, 'El email es demasiado largo.'),
  mensaje: z.string().trim().min(1, 'El mensaje es obligatorio.').max(2000, 'El mensaje admite máximo 2000 caracteres.'),
})
