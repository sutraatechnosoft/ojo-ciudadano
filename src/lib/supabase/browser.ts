import { createClient } from '@supabase/supabase-js'

// Cliente del navegador con la llave anónima. Sin sesión y sin permisos de escritura propios:
// solo sirve para subir a una ruta concreta usando el token de una URL firmada emitida por el servidor.
export function createBrowserClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
