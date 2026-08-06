alter table public.cv_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.cv_profiles
  alter column session_id drop not null;

create index if not exists cv_profiles_user_id_idx
  on public.cv_profiles (user_id);

-- The API validates Supabase JWTs and uses service_role for persistence.
-- RLS remains a fail-closed second layer: browser keys have no table policies.
alter table public.cv_profiles enable row level security;
