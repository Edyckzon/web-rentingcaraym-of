begin;
set local lock_timeout='5s';
alter table public.reglas_alquiler
  add column mostrar_equivalencias boolean not null default true,
  add column mostrar_tipo_cambio boolean not null default true,
  add column fuente_cambio text not null default 'bcrp' check (fuente_cambio in ('bcrp','manual')),
  add column cambio_manual numeric(7,4) check (cambio_manual between 0.1 and 100),
  add column fecha_cambio_manual date,
  add constraint referencia_manual_completa check (fuente_cambio <> 'manual' or (cambio_manual is not null and fecha_cambio_manual is not null));
alter table public.vehiculos
  add column tarifa_diaria_alternativa_centimos integer check (tarifa_diaria_alternativa_centimos between 1 and 100000000),
  add column tarifa_diaria_alternativa_modo text not null default 'tc' check (tarifa_diaria_alternativa_modo in ('manual','tc')),
  add constraint tarifa_diaria_alternativa_completa check (tarifa_diaria_alternativa_modo <> 'manual' or tarifa_diaria_centimos is null or tarifa_diaria_alternativa_centimos is not null);
alter table public.vehiculos
  add column tarifa_semanal_dia_alternativa_centimos integer check (tarifa_semanal_dia_alternativa_centimos between 1 and 100000000),
  add column tarifa_semanal_dia_alternativa_modo text not null default 'tc' check (tarifa_semanal_dia_alternativa_modo in ('manual','tc')),
  add constraint tarifa_semanal_dia_alternativa_completa check (tarifa_semanal_dia_alternativa_modo <> 'manual' or tarifa_semanal_dia_centimos is null or tarifa_semanal_dia_alternativa_centimos is not null);
alter table public.vehiculos
  add column tarifa_mensual_alternativa_centimos integer check (tarifa_mensual_alternativa_centimos between 1 and 100000000),
  add column tarifa_mensual_alternativa_modo text not null default 'tc' check (tarifa_mensual_alternativa_modo in ('manual','tc')),
  add constraint tarifa_mensual_alternativa_completa check (tarifa_mensual_alternativa_modo <> 'manual' or tarifa_mensual_centimos is null or tarifa_mensual_alternativa_centimos is not null);
alter table public.vehiculos
  add column garantia_alternativa_centimos integer check (garantia_alternativa_centimos between 0 and 100000000),
  add column garantia_alternativa_modo text not null default 'tc' check (garantia_alternativa_modo in ('manual','tc')),
  add constraint garantia_alternativa_completa check (garantia_alternativa_modo <> 'manual' or garantia_centimos is null or garantia_alternativa_centimos is not null);
create or replace function renting_privado.registrar_tarifa() returns trigger
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
      'deposit', old.garantia_centimos,
      'currencies', jsonb_build_object('daily', old.tarifa_diaria_moneda,
        'weeklyPerDay', old.tarifa_semanal_dia_moneda, 'monthly', old.tarifa_mensual_moneda, 'deposit', old.garantia_moneda),
      'secondary', jsonb_build_object('daily', old.tarifa_diaria_alternativa_centimos, 'weeklyPerDay', old.tarifa_semanal_dia_alternativa_centimos, 'monthly', old.tarifa_mensual_alternativa_centimos, 'deposit', old.garantia_alternativa_centimos),
      'secondaryMode', jsonb_build_object('daily', old.tarifa_diaria_alternativa_modo, 'weeklyPerDay', old.tarifa_semanal_dia_alternativa_modo, 'monthly', old.tarifa_mensual_alternativa_modo, 'deposit', old.garantia_alternativa_modo)
    )), '{}'::jsonb);
  end if;
  if TG_OP <> 'DELETE' then
    nueva := nullif(jsonb_strip_nulls(jsonb_build_object(
      'daily', new.tarifa_diaria_centimos,
      'weeklyPerDay', new.tarifa_semanal_dia_centimos,
      'monthly', new.tarifa_mensual_centimos,
      'deposit', new.garantia_centimos,
      'currencies', jsonb_build_object('daily', new.tarifa_diaria_moneda,
        'weeklyPerDay', new.tarifa_semanal_dia_moneda, 'monthly', new.tarifa_mensual_moneda, 'deposit', new.garantia_moneda),
      'secondary', jsonb_build_object('daily', new.tarifa_diaria_alternativa_centimos, 'weeklyPerDay', new.tarifa_semanal_dia_alternativa_centimos, 'monthly', new.tarifa_mensual_alternativa_centimos, 'deposit', new.garantia_alternativa_centimos),
      'secondaryMode', jsonb_build_object('daily', new.tarifa_diaria_alternativa_modo, 'weeklyPerDay', new.tarifa_semanal_dia_alternativa_modo, 'monthly', new.tarifa_mensual_alternativa_modo, 'deposit', new.garantia_alternativa_modo)
    )), '{}'::jsonb);
  end if;
  if nueva is distinct from anterior then
    insert into renting_privado.historial_tarifas (vehiculo_id, autor, anterior, nueva)
    values (coalesce(new.id, old.id), auth.uid(), anterior, nueva);
  end if;
  return null;
end $$;


commit;
