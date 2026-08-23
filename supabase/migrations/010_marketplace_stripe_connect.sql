alter table public.products
  add column if not exists stripe_account_id text;

drop policy if exists "Allow anonymous product submissions" on public.products;
drop policy if exists "Allow marketplace product submissions" on public.products;

alter table public.products
  drop column if exists lemon_squeezy_checkout_id,
  drop column if exists stripe_checkout_session_id;

alter table public.products
  drop constraint if exists products_stripe_account_id_check;

alter table public.products
  add constraint products_stripe_account_id_check
  check (
    stripe_account_id is null or
    stripe_account_id ~ '^acct_[A-Za-z0-9]+$'
  );

create index if not exists products_stripe_account_id_idx
  on public.products (stripe_account_id)
  where stripe_account_id is not null;
