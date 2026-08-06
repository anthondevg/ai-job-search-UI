create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  website_url text,
  careers_url text not null,
  integration_type text not null check (integration_type in ('greenhouse','lever','ashby','remotive','external_only')),
  created_at timestamptz not null default now()
);

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  provider text not null check (provider in ('greenhouse','lever','ashby','remotive','external')),
  board_key text not null,
  source_url text not null,
  attribution text,
  enabled boolean not null default true,
  status text not null default 'idle' check (status in ('idle','syncing','healthy','error')),
  min_sync_minutes integer not null default 360,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique(provider, board_key)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete cascade,
  provider text not null check (provider in ('greenhouse','lever','ashby','remotive','external')),
  external_id text not null,
  fingerprint text not null,
  company_name text not null,
  title text not null,
  description text not null default '',
  location text not null default '',
  workplace_type text,
  employment_type text,
  salary_text text,
  apply_url text not null,
  source_url text not null,
  posted_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  missing_syncs integer not null default 0,
  status text not null default 'active' check (status in ('active','expired')),
  eligibility text not null default 'unknown' check (eligibility in ('global','latam','relocation','restricted','unknown')),
  raw_data jsonb not null default '{}'::jsonb,
  unique(provider, external_id)
);
create index if not exists jobs_status_posted_idx on public.jobs(status, posted_at desc);
create index if not exists jobs_fingerprint_idx on public.jobs(fingerprint);
create index if not exists jobs_company_idx on public.jobs(company_id);
create index if not exists jobs_created_by_user_idx on public.jobs(created_by_user_id);

create table if not exists public.job_search_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_families text[] not null default array['Frontend','Full Stack','Backend JS/TS','AI Engineer','Applied AI','LLM Engineer'],
  skills text[] not null default '{}',
  seniority text[] not null default '{}',
  countries text[] not null default array['Worldwide','Latin America'],
  remote boolean not null default true,
  relocation boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.job_matches (
  user_id uuid references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  cv_profile_id uuid references public.cv_profiles(id) on delete set null,
  score integer not null,
  factors jsonb not null default '{}'::jsonb,
  profile_hash text,
  computed_at timestamptz not null default now(),
  primary key(user_id, job_id)
);

create table if not exists public.user_job_states (
  user_id uuid references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  status text not null check (status in ('saved','preparing','applied','interview','offer','rejected','withdrawn','archived')),
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key(user_id, job_id)
);

create table if not exists public.followed_companies (
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, company_id)
);

create table if not exists public.company_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  careers_url text,
  reason text not null,
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, company_name)
);

create table if not exists public.job_market_sync_lock (
  id integer primary key check (id = 1),
  locked_until timestamptz not null default '-infinity'
);
alter table public.job_market_sync_lock enable row level security;
insert into public.job_market_sync_lock (id) values (1) on conflict (id) do nothing;

create or replace function public.acquire_job_market_sync_lock()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  update public.job_market_sync_lock
  set locked_until = now() + interval '10 minutes'
  where id = 1 and locked_until < now();
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

create or replace function public.release_job_market_sync_lock()
returns void
language sql
security definer
set search_path = public
as $$
  update public.job_market_sync_lock set locked_until = '-infinity' where id = 1;
$$;

revoke all on function public.acquire_job_market_sync_lock() from public, anon, authenticated;
revoke all on function public.release_job_market_sync_lock() from public, anon, authenticated;
grant execute on function public.acquire_job_market_sync_lock() to service_role;
grant execute on function public.release_job_market_sync_lock() to service_role;

alter table public.companies enable row level security;
alter table public.job_sources enable row level security;
alter table public.jobs enable row level security;
alter table public.job_search_preferences enable row level security;
alter table public.job_matches enable row level security;
alter table public.user_job_states enable row level security;
alter table public.followed_companies enable row level security;
alter table public.company_suggestions enable row level security;

-- The API uses service_role and applies user_id filters. Browser clients receive no direct policies.

insert into public.companies (name, website_url, careers_url, integration_type) values
  ('OpenAI','https://openai.com','https://openai.com/careers','external_only'),
  ('Anthropic','https://anthropic.com','https://www.anthropic.com/careers','external_only'),
  ('Google DeepMind','https://deepmind.google','https://deepmind.google/careers','external_only'),
  ('Hugging Face','https://huggingface.co','https://apply.workable.com/huggingface','external_only'),
  ('Cohere','https://cohere.com','https://cohere.com/careers','external_only'),
  ('Mistral AI','https://mistral.ai','https://mistral.ai/careers','external_only'),
  ('Perplexity','https://perplexity.ai','https://www.perplexity.ai/careers','external_only'),
  ('Scale AI','https://scale.com','https://scale.com/careers','external_only'),
  ('Vercel','https://vercel.com','https://vercel.com/careers','external_only'),
  ('Supabase','https://supabase.com','https://supabase.com/careers','external_only'),
  ('PostHog','https://posthog.com','https://posthog.com/careers','external_only'),
  ('GitLab','https://gitlab.com','https://about.gitlab.com/jobs','external_only'),
  ('Automattic','https://automattic.com','https://automattic.com/work-with-us','external_only'),
  ('Cloudflare','https://cloudflare.com','https://www.cloudflare.com/careers/jobs','external_only'),
  ('Stripe','https://stripe.com','https://stripe.com/jobs','external_only'),
  ('Shopify','https://shopify.com','https://www.shopify.com/careers','external_only'),
  ('Canonical','https://canonical.com','https://canonical.com/careers','external_only'),
  ('Grafana Labs','https://grafana.com','https://grafana.com/about/careers/open-positions','external_only'),
  ('Elastic','https://elastic.co','https://www.elastic.co/careers','external_only'),
  ('Zapier','https://zapier.com','https://zapier.com/jobs','external_only')
on conflict (name) do nothing;

insert into public.job_sources (provider, board_key, source_url, attribution, min_sync_minutes)
values ('remotive','remote-jobs','https://remotive.com/api/remote-jobs','Remotive',360)
on conflict (provider, board_key) do nothing;

with verified_sources(company_name, provider, board_key, source_url) as (
  values
    ('OpenAI','ashby','openai','https://jobs.ashbyhq.com/openai'),
    ('Cohere','ashby','cohere','https://jobs.ashbyhq.com/cohere'),
    ('Perplexity','ashby','perplexity','https://jobs.ashbyhq.com/perplexity'),
    ('Supabase','ashby','supabase','https://jobs.ashbyhq.com/supabase'),
    ('PostHog','ashby','posthog','https://jobs.ashbyhq.com/posthog'),
    ('Scale AI','greenhouse','scaleai','https://boards.greenhouse.io/scaleai'),
    ('Cloudflare','greenhouse','cloudflare','https://boards.greenhouse.io/cloudflare'),
    ('Stripe','greenhouse','stripe','https://boards.greenhouse.io/stripe'),
    ('GitLab','greenhouse','gitlab','https://boards.greenhouse.io/gitlab'),
    ('Canonical','greenhouse','canonical','https://boards.greenhouse.io/canonical'),
    ('Grafana Labs','greenhouse','grafanalabs','https://boards.greenhouse.io/grafanalabs'),
    ('Elastic','greenhouse','elastic','https://boards.greenhouse.io/elastic')
)
insert into public.job_sources (company_id, provider, board_key, source_url, min_sync_minutes)
select companies.id, verified_sources.provider, verified_sources.board_key, verified_sources.source_url, 360
from verified_sources join public.companies on companies.name = verified_sources.company_name
on conflict (provider, board_key) do update set company_id = excluded.company_id, source_url = excluded.source_url;

update public.companies set integration_type = 'ashby'
where name in ('OpenAI','Cohere','Perplexity','Supabase','PostHog');
update public.companies set integration_type = 'greenhouse'
where name in ('Scale AI','Cloudflare','Stripe','GitLab','Canonical','Grafana Labs','Elastic');
