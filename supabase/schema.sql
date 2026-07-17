-- APEX Agency OS — schema multi-usuario con RLS
-- Ejecuta este SQL en Supabase → SQL Editor

-- Perfiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  active_project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Proyectos
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  industry text not null default '',
  offer text not null default '',
  audience text not null default '',
  goals text not null default '',
  stack text not null default '',
  budget text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

alter table public.profiles
  drop constraint if exists profiles_active_project_id_fkey;

alter table public.profiles
  add constraint profiles_active_project_id_fkey
  foreign key (active_project_id) references public.projects (id) on delete set null;

-- Deliverables
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  module_id text not null default 'consejo',
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists deliverables_user_id_idx on public.deliverables (user_id);

-- Conversaciones (historial tipo ChatGPT)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  module_id text not null,
  title text not null default 'Nueva conversación',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_module_idx
  on public.conversations (user_id, module_id, updated_at desc);

-- Mensajes
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx
  on public.messages (conversation_id, created_at);

-- Memoria a largo plazo (hechos que APEX recuerda)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  kind text not null default 'fact',
  content text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_id_idx on public.memories (user_id, updated_at desc);

-- Auto-perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Projects policies
drop policy if exists "projects_all_own" on public.projects;
create policy "projects_all_own" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Deliverables
drop policy if exists "deliverables_all_own" on public.deliverables;
create policy "deliverables_all_own" on public.deliverables
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Conversations
drop policy if exists "conversations_all_own" on public.conversations;
create policy "conversations_all_own" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Messages
drop policy if exists "messages_all_own" on public.messages;
create policy "messages_all_own" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Memories
drop policy if exists "memories_all_own" on public.memories;
create policy "memories_all_own" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
