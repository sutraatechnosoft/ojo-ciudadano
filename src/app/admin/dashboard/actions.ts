'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { idSchema, leerPunto } from '@/lib/schemas'
import { BUCKET, archivoDeForm, rutaDesdeUrl, subirImagen } from '@/lib/imagenes'
import type { FormState } from '@/lib/types'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  // Defensa en profundidad: además del middleware, exige 2FA completado (aal2).
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== 'aal2') redirect('/admin/2fa')
  return { supabase, user }
}

function refrescar() {
  revalidatePath('/')
  revalidatePath('/admin/dashboard')
}

// ---------- crear / editar ----------
export async function createPunto(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser()
  const parsed = leerPunto(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  let imagen_url: string | null = null
  const file = archivoDeForm(formData, 'foto')
  if (file) {
    const res = await subirImagen(supabase, file, 'puntos')
    if (res.error) return { error: res.error }
    imagen_url = res.url ?? null
  }

  // Todo punto nace "pendiente": debe verificarse en sitio antes de publicarse.
  const { error } = await supabase.from('puntos').insert({
    ...parsed.data,
    imagen_url,
    estado: 'pendiente',
  })
  if (error) return { error: 'No se pudo guardar el punto.' }

  refrescar()
  redirect('/admin/dashboard')
}

export async function updatePunto(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser()
  if (!idSchema.safeParse(id).success) return { error: 'Identificador inválido.' }
  const parsed = leerPunto(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const update: Record<string, unknown> = { ...parsed.data }
  let oldPath: string | null = null

  const file = archivoDeForm(formData, 'foto')
  if (file) {
    const { data: current } = await supabase.from('puntos').select('imagen_url').eq('id', id).single()
    oldPath = rutaDesdeUrl(current?.imagen_url ?? null)
    const res = await subirImagen(supabase, file, 'puntos')
    if (res.error) return { error: res.error }
    update.imagen_url = res.url
  }

  const { error } = await supabase.from('puntos').update(update).eq('id', id)
  if (error) return { error: 'No se pudo actualizar el punto.' }
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])

  refrescar()
  redirect('/admin/dashboard')
}

// ---------- verificación en sitio ----------
const verificarSchema = z.object({
  confirmo: z.literal('on', {
    errorMap: () => ({ message: 'Debes confirmar que visitaste el sitio y comprobaste que existe.' }),
  }),
  nota: z.string().trim().max(500, 'La nota admite máximo 500 caracteres.'),
})

export async function verificarPunto(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser()
  if (!idSchema.safeParse(id).success) return { error: 'Identificador inválido.' }

  const parsed = verificarSchema.safeParse({
    confirmo: formData.get('confirmo'),
    nota: formData.get('nota') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const update: Record<string, unknown> = {
    estado: 'verificado',
    verificado_por: user.id,
    verificado_en: new Date().toISOString(),
    nota_verificacion: parsed.data.nota || null,
  }

  const file = archivoDeForm(formData, 'foto_verificacion')
  if (file) {
    const res = await subirImagen(supabase, file, 'verificaciones')
    if (res.error) return { error: res.error }
    update.foto_verificacion_url = res.url
  }

  const { error } = await supabase.from('puntos').update(update).eq('id', id)
  if (error) return { error: 'No se pudo verificar el punto.' }

  refrescar()
  redirect('/admin/dashboard')
}

const rechazarSchema = z.object({
  motivo: z.string().trim().min(3, 'Indica el motivo del rechazo.').max(500, 'El motivo admite máximo 500 caracteres.'),
})

export async function rechazarPunto(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser()
  if (!idSchema.safeParse(id).success) return { error: 'Identificador inválido.' }

  const parsed = rechazarSchema.safeParse({ motivo: formData.get('motivo') ?? '' })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('puntos')
    .update({
      estado: 'rechazado',
      verificado_por: user.id,
      verificado_en: new Date().toISOString(),
      nota_verificacion: parsed.data.motivo,
    })
    .eq('id', id)
  if (error) return { error: 'No se pudo rechazar el punto.' }

  refrescar()
  redirect('/admin/dashboard?estado=rechazado')
}

// Devuelve un punto a "pendiente" (deja de mostrarse en el mapa).
export async function reabrirPunto(formData: FormData) {
  const { supabase } = await requireUser()
  const id = idSchema.safeParse(formData.get('id'))
  if (!id.success) return

  const { data: current } = await supabase.from('puntos').select('foto_verificacion_url').eq('id', id.data).single()
  const { error } = await supabase
    .from('puntos')
    .update({
      estado: 'pendiente',
      verificado_por: null,
      verificado_en: null,
      nota_verificacion: null,
      foto_verificacion_url: null,
    })
    .eq('id', id.data)
  if (error) return

  const path = rutaDesdeUrl(current?.foto_verificacion_url ?? null)
  if (path) await supabase.storage.from(BUCKET).remove([path])

  refrescar()
  redirect('/admin/dashboard')
}

// ---------- eliminar ----------
export async function deletePunto(formData: FormData) {
  const { supabase } = await requireUser()
  const id = idSchema.safeParse(formData.get('id'))
  if (!id.success) return

  const { data: current } = await supabase
    .from('puntos')
    .select('imagen_url, foto_verificacion_url')
    .eq('id', id.data)
    .single()
  const { error } = await supabase.from('puntos').delete().eq('id', id.data)
  if (error) return

  const paths = [current?.imagen_url, current?.foto_verificacion_url]
    .map((u) => rutaDesdeUrl(u ?? null))
    .filter((p): p is string => !!p)
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)

  refrescar()
}
