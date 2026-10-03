-- =====================================================================
-- Migración 2FA: las políticas de administrador exigen sesión aal2
-- (contraseña + código TOTP). Sin esto, alguien con solo la contraseña
-- podría llamar a la API de Supabase directamente y saltarse el 2FA de la app.
-- Ejecutar UNA vez en Supabase > SQL Editor.
-- IMPORTANTE: antes, cada verificador debe haber activado su 2FA entrando a /admin/login.
-- =====================================================================

drop policy if exists "puntos_select_admin" on public.puntos;
drop policy if exists "puntos_insert_admin" on public.puntos;
drop policy if exists "puntos_update_admin" on public.puntos;
drop policy if exists "puntos_delete_admin" on public.puntos;

create policy "puntos_select_admin" on public.puntos for select to authenticated
  using ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "puntos_insert_admin" on public.puntos for insert to authenticated
  with check ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "puntos_update_admin" on public.puntos for update to authenticated
  using ((select auth.jwt() ->> 'aal') = 'aal2') with check ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "puntos_delete_admin" on public.puntos for delete to authenticated
  using ((select auth.jwt() ->> 'aal') = 'aal2');

drop policy if exists "fotos_insert_admin" on storage.objects;
drop policy if exists "fotos_update_admin" on storage.objects;
drop policy if exists "fotos_delete_admin" on storage.objects;

create policy "fotos_insert_admin" on storage.objects for insert to authenticated
  with check (bucket_id = 'puntos-fotos' and (select auth.jwt() ->> 'aal') = 'aal2');
create policy "fotos_update_admin" on storage.objects for update to authenticated
  using (bucket_id = 'puntos-fotos' and (select auth.jwt() ->> 'aal') = 'aal2');
create policy "fotos_delete_admin" on storage.objects for delete to authenticated
  using (bucket_id = 'puntos-fotos' and (select auth.jwt() ->> 'aal') = 'aal2');
