-- PELIGRO: borra TODOS los usuarios y datos de APEX.
-- Ejecutar en Supabase → SQL Editor → Run
-- No se puede deshacer.

-- 1) Datos de la app
truncate table public.messages restart identity cascade;
truncate table public.conversations restart identity cascade;
truncate table public.deliverables restart identity cascade;
truncate table public.memories restart identity cascade;
truncate table public.projects restart identity cascade;
truncate table public.profiles restart identity cascade;

-- 2) Usuarios de autenticación (emails registrados, sesiones, etc.)
delete from auth.users;

-- Verificación (debe devolver 0)
-- select count(*) from auth.users;
-- select count(*) from public.profiles;
