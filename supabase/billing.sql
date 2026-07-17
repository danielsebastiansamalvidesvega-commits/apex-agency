-- APEX Billing — ejecuta en Supabase → SQL Editor
-- Añade suscripción y uso diario a perfiles existentes

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  add column if not exists plan_status text not null default 'active';

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.profiles
  add column if not exists stripe_subscription_id text;

alter table public.profiles
  add column if not exists plan_period_end timestamptz;

-- Contador de mensajes por día (límites del plan)
create table if not exists public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default (timezone('utc', now()))::date,
  messages int not null default 0,
  primary key (user_id, day)
);

create index if not exists usage_daily_user_day_idx
  on public.usage_daily (user_id, day desc);

alter table public.usage_daily enable row level security;

drop policy if exists "usage_select_own" on public.usage_daily;
create policy "usage_select_own" on public.usage_daily
  for select using (auth.uid() = user_id);

-- Insert/update desde API con el usuario autenticado
drop policy if exists "usage_upsert_own" on public.usage_daily;
create policy "usage_upsert_own" on public.usage_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

comment on column public.profiles.plan is 'free | pro | agency';
comment on column public.profiles.plan_status is 'active | trialing | canceled | past_due | unpaid';
