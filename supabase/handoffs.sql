-- Decisiones / ideas transferidas entre módulos (estrategia → copy, etc.)
create table if not exists public.handoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  from_module text not null,
  to_module text not null,
  title text not null default '',
  content text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists handoffs_user_to_idx
  on public.handoffs (user_id, to_module, active, created_at desc);

alter table public.handoffs enable row level security;

drop policy if exists "handoffs_all_own" on public.handoffs;
create policy "handoffs_all_own" on public.handoffs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
