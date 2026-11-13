begin;
set local lock_timeout = '5s';

alter table public.vehiculos
  add column tarifa_diaria_centimos integer check (tarifa_diaria_centimos between 1 and 100000000),
  add column tarifa_semanal_dia_centimos integer check (tarifa_semanal_dia_centimos between 1 and 100000000),
  add column tarifa_mensual_centimos integer check (tarifa_mensual_centimos between 1 and 100000000),
  add column garantia_centimos integer check (garantia_centimos between 0 and 100000000);

create table renting_privado.historial_tarifas (
  id bigint generated always as identity primary key,
  vehiculo_id text not null,
  cambiado_en timestamptz not null default clock_timestamp(),
  autor uuid,
  anterior jsonb,
  nueva jsonb
);
create index historial_tarifas_vehiculo_fecha
  on renting_privado.historial_tarifas (vehiculo_id, cambiado_en desc, id desc);
revoke all on renting_privado.historial_tarifas from public, anon, authenticated;

create function renting_privado.registrar_tarifa() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  anterior jsonb;
  nueva jsonb;
begin
  if TG_OP <> 'INSERT' then
    anterior := nullif(jsonb_strip_nulls(jsonb_build_object(
      'daily', old.tarifa_diaria_centimos,
      'weeklyPerDay', old.tarifa_semanal_dia_centimos,
      'monthly', old.tarifa_mensual_centimos,
      'deposit', old.garantia_centimos
    )), '{}'::jsonb);
  end if;
  if TG_OP <> 'DELETE' then
    nueva := nullif(jsonb_strip_nulls(jsonb_build_object(
      'daily', new.tarifa_diaria_centimos,
      'weeklyPerDay', new.tarifa_semanal_dia_centimos,
      'monthly', new.tarifa_mensual_centimos,
      'deposit', new.garantia_centimos
    )), '{}'::jsonb);
  end if;
  if nueva is distinct from anterior then
    insert into renting_privado.historial_tarifas (vehiculo_id, autor, anterior, nueva)
    values (coalesce(new.id, old.id), auth.uid(), anterior, nueva);
  end if;
  return null;
end $$;
revoke all on function renting_privado.registrar_tarifa() from public, anon, authenticated;
create trigger registrar_tarifa
  after insert or update or delete on public.vehiculos
  for each row execute function renting_privado.registrar_tarifa();

commit;
