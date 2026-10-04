-- Product reads and writes are served by the Next.js server with the service role.
-- Do not expose pending submissions or private storage keys via the public REST API.
alter table public.products enable row level security;
revoke all on table public.products from anon, authenticated;

