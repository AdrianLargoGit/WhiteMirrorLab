alter table public.products
  drop constraint if exists products_price_nonnegative_check;

alter table public.products
  add constraint products_price_nonnegative_check
  check (price >= 0);
