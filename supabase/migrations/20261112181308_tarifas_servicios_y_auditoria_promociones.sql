begin;
set local lock_timeout = '5s';

create table public.tarifas_servicios (
  servicio text primary key check (servicio in ('empresas', 'excavadora-cat-330dl', 'volquetes')),
  precio_centimos integer check (precio_centimos between 1 and 100000000),
  unidad text not null default '' check (length(unidad) <= 40),
  check (precio_centimos is null or length(btrim(unidad)) > 0)
);
insert into public.tarifas_servicios(servicio) values ('empresas'), ('excavadora-cat-330dl'), ('volquetes');
alter table public.tarifas_servicios enable row level security;
revoke all on public.tarifas_servicios from public, anon, authenticated;
grant select on public.tarifas_servicios to anon, authenticated;
grant update(precio_centimos, unidad) on public.tarifas_servicios to authenticated;
create policy lectura on public.tarifas_servicios for select to anon, authenticated using (true);
create policy mantenimiento on public.tarifas_servicios for update to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));

alter table renting_privado.historial_tarifas add column tipo text not null default 'tarifa';
create function renting_privado.registrar_promocion() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if to_jsonb(new) is distinct from to_jsonb(old) then
    insert into renting_privado.historial_tarifas(vehiculo_id, autor, anterior, nueva, tipo)
    values(coalesce(new.vehiculo_id, old.vehiculo_id), auth.uid(), to_jsonb(old), to_jsonb(new), 'promocion');
  end if;
  return null;
end $$;
revoke all on function renting_privado.registrar_promocion() from public, anon, authenticated;
create trigger registrar_promocion after insert or update or delete on public.promociones_alquiler
for each row execute function renting_privado.registrar_promocion();

commit;
