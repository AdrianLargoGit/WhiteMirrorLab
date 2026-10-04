-- Serialize device registration per license, including concurrent requests.
create or replace function public.enforce_pro_license_device_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  allowed_devices integer;
  active_devices integer;
begin
  if new.status <> 'active' then return new; end if;
  select max_devices into allowed_devices
    from public.pro_licenses where id = new.license_id for update;
  select count(*) into active_devices
    from public.pro_license_activations
    where license_id = new.license_id and status = 'active' and id <> new.id;
  if active_devices >= allowed_devices then
    raise exception 'device_limit_reached' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists pro_license_device_limit on public.pro_license_activations;
create trigger pro_license_device_limit
before insert or update of status, license_id on public.pro_license_activations
for each row execute function public.enforce_pro_license_device_limit();
