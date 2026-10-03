import type { Categoria } from './categorias'

export type Estado = 'pendiente' | 'verificado' | 'rechazado'

export interface Punto {
  id: string
  categoria: Categoria
  latitud: number
  longitud: number
  imagen_url: string | null
  estado: Estado
  verificado_en: string | null
  nota_verificacion: string | null
  foto_verificacion_url: string | null
  created_at: string
}

// Lo único que se expone en el mapa público (solo puntos verificados).
export type PuntoMapa = Pick<
  Punto,
  | 'id' | 'categoria' | 'latitud' | 'longitud'
  | 'imagen_url' | 'verificado_en' | 'nota_verificacion' | 'foto_verificacion_url'
>

export type FormState = { error?: string; ok?: boolean }

// Respuesta de la acción que prepara la subida directa de la foto a Storage.
export type SubidaState = { error?: string; path?: string; token?: string; ticket?: string }
