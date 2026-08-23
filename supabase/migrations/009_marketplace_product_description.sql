alter table public.products
  add column if not exists description text;

alter table public.products
  drop constraint if exists products_description_length_check;

alter table public.products
  add constraint products_description_length_check
  check (
    description is null or (
      char_length(btrim(description)) >= 40 and
      char_length(btrim(description)) <= 1600
    )
  );
