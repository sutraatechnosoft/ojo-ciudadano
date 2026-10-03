'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verificarCaptcha } from '@/lib/captcha'

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
})

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  // Mensaje genérico: no revela si el usuario existe (OWASP A07).
  const generic = 'Credenciales inválidas o acceso no autorizado.'
  if (!parsed.success) return { error: generic }

  const errCaptcha = await verificarCaptcha(formData)
  if (errCaptcha) return { error: errCaptcha }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: generic }

  // La sesión queda en nivel aal1: /admin/2fa pide el código (o configura el 2FA la primera vez).
  redirect('/admin/2fa')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
