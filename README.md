# Ojo Ciudadano

Mapa ciudadano de huecos, obras inconclusas, alumbrado dañado y otros problemas de infraestructura.
Cualquier persona puede **reportar** un problema (con foto y ubicación), pero **solo se publica en el mapa
cuando un verificador del equipo va al sitio y confirma que existe**.

Stack: Next.js 15 (App Router, Server Actions) · Supabase (Postgres, Auth, Storage, RLS) · OpenStreetMap + Leaflet · Tailwind.

## Cómo funciona

1. **Reporte** (`/reportar`, público): categoría, título, descripción, ubicación (clic en mapa o GPS) y foto obligatoria.
   Entra con estado `pendiente` y **no es visible** públicamente.
2. **Verificación** (`/admin/dashboard`, solo admins): el verificador abre el reporte, va al lugar y lo marca como
   **verificado** (confirmando que visitó el sitio; opcionalmente con nota y foto tomada en el sitio) o lo **rechaza** con un motivo.
3. **Mapa público** (`/`): muestra únicamente los puntos `verificado`, con la fecha y la evidencia de la verificación.

Estados: `pendiente` → `verificado` | `rechazado` (se puede devolver a `pendiente`, lo que retira el punto del mapa).

## 1. Configurar Supabase

1. Crea un proyecto en https://supabase.com.
2. **SQL Editor**: ejecuta `supabase/schema.sql`.
   (Si ya tenías la versión anterior de la app, ejecuta en su lugar `supabase/migracion_verificacion.sql`.)
3. **Authentication → Sign In / Providers**: deja Email habilitado y **desactiva "Allow new users to sign up"**.
   Cualquier usuario autenticado puede verificar reportes, así que solo deben existir los verificadores que tú crees.
4. **Authentication → Users → Add user**: crea a cada verificador con una contraseña robusta (mín. 12 caracteres).
5. **Project Settings → API**: copia `Project URL`, la llave `anon public` y la llave `service_role`.

## 2. Ejecutar en local

```bash
npm install
cp .env.example .env.local      # completa las variables
npm run dev
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave service_role. **Solo servidor**, nunca con prefijo `NEXT_PUBLIC_` |
| `RATE_LIMIT_SALT` | Texto aleatorio largo para anonimizar IPs en el límite de reportes |
| `NEXT_PUBLIC_MAP_LAT/LON/ZOOM` | (Opcional) centro y zoom inicial del mapa, p. ej. tu ciudad |

- Mapa público: http://localhost:3000
- Reportar: http://localhost:3000/reportar
- Verificadores: http://localhost:3000/admin/login

## 3. Subir a GitHub

```bash
git init
git add .
git commit -m "Ojo Ciudadano"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ojo-ciudadano.git
git push -u origin main
```

`.env.local` está en `.gitignore`: nunca subas llaves al repositorio.

## 4. Deploy en Vercel

1. https://vercel.com → **Add New… → Project** → importa el repositorio.
2. En **Environment Variables** agrega las 4 variables obligatorias de la tabla anterior (y las del mapa si las usas).
3. **Deploy**. Cada `git push` a `main` redeploya automáticamente.
4. En Supabase → **Authentication → URL Configuration**, define *Site URL* con `https://tu-app.vercel.app`.

> Las variables `NEXT_PUBLIC_*` se leen en el build: si las cambias, haz *Redeploy*.

## Seguridad (OWASP)

| Control | Implementación |
|---|---|
| A01 Control de acceso | `src/middleware.ts` valida la sesión (`getUser()`) en `/admin/*`; cada Server Action revalida el usuario; RLS: el rol anónimo **solo puede leer puntos verificados** y no tiene ninguna política de escritura. |
| A02 Criptografía | HTTPS + HSTS. La llave `service_role` solo existe en el servidor (`server-only`) y se usa únicamente para recibir reportes públicos. |
| A03 Inyección | Cliente Supabase parametrizado; validación con Zod en el servidor; restricciones `CHECK` en la base de datos. |
| A04/A07 Diseño y autenticación | Reportes públicos con límite de 5/hora por IP (solo se guarda un hash con sal), honeypot anti-bots, foto obligatoria, y publicación solo tras verificación humana. Rate limiting nativo de Supabase Auth en el login; error genérico; registro público desactivado. |
| A05 Configuración | CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (`next.config.ts`). |
| A08 Integridad | Fotos: solo JPG/PNG/WebP, máx. 5 MB, verificación de firma binaria y nombre UUID; el bucket aplica los mismos límites. |

Privacidad: el reporte no pide datos personales. La IP no se almacena, solo un hash con sal para el límite por hora.

## Estructura

```
src/app/page.tsx                          Mapa público (solo verificados)
src/app/reportar/                         Formulario público de reporte
src/app/admin/login                       Login de verificadores
src/app/admin/dashboard                   Listado por estado, nuevo, editar
src/app/admin/dashboard/revisar/[id]      Verificar / rechazar / devolver a pendiente
src/components/                           MapView, LocationPicker, PuntoForm, ReviewForms
src/lib/                                  Esquemas Zod, imágenes, categorías, clientes Supabase
supabase/schema.sql                       Esquema completo + RLS + Storage
supabase/migracion_verificacion.sql       Migración desde la versión anterior
```
