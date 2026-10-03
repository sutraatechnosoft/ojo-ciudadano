-- =====================================================================
-- Migración v2: nueva categoría, sin título/descripción, formulario de contacto
-- Ejecutar UNA vez en Supabase > SQL Editor (sobre una base ya instalada).
-- =====================================================================

-- 1) Categoría "obra_en_ejecucion"
alter table public.puntos drop constraint if exists puntos_categoria_check;
alter table public.puntos
  add constraint puntos_categoria_check
  check (categoria in ('hueco', 'obra_inconclusa', 'obra_en_ejecucion', 'alumbrado', 'otro'));

-- 2) Título ya no se captura: se conservan las columnas (y los datos antiguos), pero nombre deja de ser obligatorio
alter table public.puntos alter column nombre drop not null;

-- 3) Mensajes de contacto (solo accesibles con service_role; sin políticas para anon/authenticated)
create table if not exists public.contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  mensaje text not null check (char_length(mensaje) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.contactos enable row level security;
