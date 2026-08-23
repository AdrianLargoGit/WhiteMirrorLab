do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null,
  blob_url text,
  status public.product_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  creator_email text not null,
  creator_name text not null,
  stripe_account_id text,
  cover_image_url text,
  preview_image_urls jsonb not null default '[]'::jsonb,
  pet_count int4 not null default 0,
  clothes_count int4 not null default 0,
  download_blob_url text
);

alter table public.products
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists price numeric,
  add column if not exists blob_url text,
  add column if not exists status public.product_status default 'pending',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now(),
  add column if not exists creator_email text,
  add column if not exists creator_name text,
  add column if not exists stripe_account_id text,
  add column if not exists cover_image_url text,
  add column if not exists preview_image_urls jsonb default '[]'::jsonb,
  add column if not exists pet_count int4 default 0,
  add column if not exists clothes_count int4 default 0,
  add column if not exists download_blob_url text;

alter table public.products
  alter column status set default 'pending',
  alter column created_at set default now(),
  alter column updated_at set default now(),
  alter column preview_image_urls set default '[]'::jsonb,
  alter column pet_count set default 0,
  alter column clothes_count set default 0;

create or replace function public.set_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at_trigger on public.products;
create trigger products_updated_at_trigger
  before update on public.products
  for each row
  execute function public.set_products_updated_at();

create index if not exists products_status_created_at_idx
  on public.products (status, created_at desc);
