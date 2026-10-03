-- =====================================================================
-- Última barrera en la base de datos: coordenadas dentro del rectángulo que contiene a Venezuela
-- (incluye islas, Isla de Aves y la Guayana Esequiba). La validación fina (contorno) se hace en la app.
-- "not valid": no revisa filas existentes, solo aplica a inserciones/actualizaciones nuevas.
-- Ejecutar UNA vez en Supabase > SQL Editor.
-- =====================================================================
alter table public.puntos drop constraint if exists puntos_coordenadas_venezuela;
alter table public.puntos
  add constraint puntos_coordenadas_venezuela
  check (latitud between 0.5 and 16 and longitud between -73.6 and -59.5) not valid;
