-- Dale plan Agency al owner (tú).
-- Opción A: por email (recomendado)
-- update public.profiles
-- set plan = 'agency', plan_status = 'active'
-- where lower(email) = lower('TU_EMAIL_AQUI@gmail.com');

-- Opción B: si eres el único usuario / todos los perfiles de prueba
update public.profiles
set plan = 'agency', plan_status = 'active'
where plan is distinct from 'agency'
   or plan_status is distinct from 'active';

-- Verificación:
-- select id, email, plan, plan_status from public.profiles;
