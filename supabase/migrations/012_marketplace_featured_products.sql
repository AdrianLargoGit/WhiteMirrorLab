alter table public.products
  add column if not exists featured_rank int4;

alter table public.products
  drop constraint if exists products_featured_rank_check;

alter table public.products
  add constraint products_featured_rank_check
  check (featured_rank is null or featured_rank between 1 and 3);

create unique index if not exists products_featured_rank_unique_idx
  on public.products (featured_rank)
  where featured_rank is not null;

create index if not exists products_status_featured_created_at_idx
  on public.products (status, featured_rank, created_at desc);
