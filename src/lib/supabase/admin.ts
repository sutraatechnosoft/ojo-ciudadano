import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con service_role: SOLO en servidor (el paquete `server-only` rompe el build si
// se importa desde un componente cliente). Se usa para recibir reportes públicos, de modo
// que el rol anónimo NO tenga permisos de escritura en la base de datos.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
