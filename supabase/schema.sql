-- =====================================================================
-- Ojo Ciudadano · esquema completo (instalación nueva)
-- Ejecutar en Supabase > SQL Editor.
-- Si ya habías ejecutado la versión anterior, usa migracion_verificacion.sql
-- =====================================================================

create table if not exists public.puntos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null default 'otro'
    check (categoria in ('hueco', 'obra_inconclusa', 'alumbrado', 'otro')),
  nombre text not null check (char_length(nombre) between 1 and 120),
  descripcion text check (descripcion is null or char_length(descripcion) <= 1000),
  latitud numeric not null check (latitud between -90 and 90),
  longitud numeric not null check (longitud between -180 and 180),
  imagen_url text,
  -- Flujo de verificación en sitio
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'verificado', 'rechazado')),
  verificado_por uuid references auth.users (id) on delete set null,
  verificado_en timestamptz,
  nota_verificacion text check (nota_verificacion is null or char_length(nota_verificacion) <= 500),
  foto_verificacion_url text,
  created_at timestamptz not null default now(),
  check (estado <> 'verificado' or verificado_en is not null)
);

create index if not exists puntos_estado_idx on public.puntos (estado);

alter table public.puntos enable row level security;

-- Público (anónimo): SOLO ve puntos verificados
create policy "puntos_select_verificados"
  on public.puntos for select
  to anon, authenticated
  using (estado = 'verificado');

-- Administradores (autenticados): ven todo y gestionan todo
create policy "puntos_select_admin"
  on public.puntos for select
  to authenticated
  using (true);

create policy "puntos_insert_admin"
  on public.puntos for insert
  to authenticated
  with check (true);

create policy "puntos_update_admin"
  on public.puntos for update
  to authenticated
  using (true) with check (true);

create policy "puntos_delete_admin"
  on public.puntos for delete
  to authenticated
  using (true);

-- Los reportes ciudadanos los inserta el servidor con la llave service_role (que ignora RLS).
-- El rol anónimo NO tiene ninguna política de escritura.

-- Límite de reportes por IP (se guarda solo un hash). Sin políticas: solo accesible con service_role.
create table if not exists public.reportes_limite (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists reportes_limite_idx on public.reportes_limite (ip_hash, created_at);
alter table public.reportes_limite enable row level security;
-- Limpieza opcional: delete from public.reportes_limite where created_at < now() - interval '2 days';

-- Bucket de fotos: lectura pública, 5 MB máx., solo JPG/PNG/WebP
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('puntos-fotos', 'puntos-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "fotos_select_publico"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'puntos-fotos');

create policy "fotos_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'puntos-fotos');

create policy "fotos_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'puntos-fotos');

create policy "fotos_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'puntos-fotos');
