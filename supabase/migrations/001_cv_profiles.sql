create extension if not exists "pgcrypto";

create table if not exists public.cv_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  file_name text not null,
  profile jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists cv_profiles_session_id_idx
  on public.cv_profiles (session_id);

create index if not exists cv_profiles_created_at_idx
  on public.cv_profiles (created_at desc);

-- Backend uses service_role; disable RLS for this session-scoped table.
alter table public.cv_profiles disable row level security;
