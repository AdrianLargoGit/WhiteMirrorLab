create extension if not exists pgcrypto;

create table if not exists public.pro_licenses (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  plan text not null default 'monthly',
  status text not null default 'active',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  offline_until timestamptz not null,
  max_devices integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pro_licenses_plan_check check (plan = 'monthly'),
  constraint pro_licenses_status_check check (status in ('active', 'revoked', 'expired')),
  constraint pro_licenses_max_devices_check check (max_devices > 0)
);

create unique index if not exists pro_licenses_subject_active_idx
  on public.pro_licenses (lower(subject))
  where status = 'active';

create table if not exists public.pro_license_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.pro_licenses(id) on delete cascade,
  device_id text not null,
  device_name text,
  platform text,
  app_version text,
  status text not null default 'active',
  activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (license_id, device_id),
  constraint pro_license_activations_status_check check (status in ('active', 'revoked'))
);

create table if not exists public.pro_license_events (
  id bigint generated always as identity primary key,
  license_id uuid references public.pro_licenses(id) on delete set null,
  activation_id uuid references public.pro_license_activations(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pro_licenses_set_updated_at on public.pro_licenses;
create trigger pro_licenses_set_updated_at
before update on public.pro_licenses
for each row execute function public.set_updated_at();

drop trigger if exists pro_license_activations_set_updated_at on public.pro_license_activations;
create trigger pro_license_activations_set_updated_at
before update on public.pro_license_activations
for each row execute function public.set_updated_at();

alter table public.pro_licenses enable row level security;
alter table public.pro_license_activations enable row level security;
alter table public.pro_license_events enable row level security;
