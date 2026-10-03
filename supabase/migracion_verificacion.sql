-- =====================================================================
-- Migración: de la versión 1 (solo admin) a Ojo Ciudadano (verificación en sitio)
-- Ejecutar UNA vez en Supabase > SQL Editor.
-- =====================================================================

alter table public.puntos
  add column if not exists categoria text not null default 'otro'
    check (categoria in ('hueco', 'obra_inconclusa', 'alumbrado', 'otro')),
  add column if not exists descripcion text
    check (descripcion is null or char_length(descripcion) <= 1000),
  add column if not exists estado text not null default 'pendiente'
    check (estado in ('pendiente', 'verificado', 'rechazado')),
  add column if not exists verificado_por uuid references auth.users (id) on delete set null,
  add column if not exists verificado_en timestamptz,
  add column if not exists nota_verificacion text
    check (nota_verificacion is null or char_length(nota_verificacion) <= 500),
  add column if not exists foto_verificacion_url text;

create index if not exists puntos_estado_idx on public.puntos (estado);

-- Los puntos que ya existían quedan "pendiente". Si ya los verificaste, descomenta:
-- update public.puntos set estado = 'verificado', verificado_en = now() where estado = 'pendiente';

drop policy if exists "puntos_select_publico" on public.puntos;

create policy "puntos_select_verificados"
  on public.puntos for select
  to anon, authenticated
  using (estado = 'verificado');

create policy "puntos_select_admin"
  on public.puntos for select
  to authenticated
  using (true);

create table if not exists public.reportes_limite (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists reportes_limite_idx on public.reportes_limite (ip_hash, created_at);
alter table public.reportes_limite enable row level security;
