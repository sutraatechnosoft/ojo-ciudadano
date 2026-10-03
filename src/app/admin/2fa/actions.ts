'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { FormState } from '@/lib/types'

const codigoSchema = z.string().regex(/^\d{6}$/, 'Ingresa los 6 dígitos del código.')

// Sirve para el primer enrolamiento (verifica el factor recién creado) y para los inicios de sesión posteriores.
export async function verificarCodigo(factorId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!z.string().uuid().safeParse(factorId).success) return { error: 'Factor inválido.' }
  const code = codigoSchema.safeParse(String(formData.get('codigo') ?? '').replace(/\s/g, ''))
  if (!code.success) return { error: code.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data })
  if (error) return { error: 'Código incorrecto o vencido. Inténtalo de nuevo.' }

  redirect('/admin/dashboard')
}
