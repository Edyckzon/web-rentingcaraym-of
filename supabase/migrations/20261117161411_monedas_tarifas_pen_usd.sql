-- Additive change: existing prices and records are preserved. PEN is their existing currency.
begin;
set local lock_timeout = '5s';
alter table public.vehiculos
  add column tarifa_diaria_moneda text not null default 'PEN' check (tarifa_diaria_moneda in ('PEN','USD')),
  add column tarifa_semanal_dia_moneda text not null default 'PEN' check (tarifa_semanal_dia_moneda in ('PEN','USD')),
  add column tarifa_mensual_moneda text not null default 'PEN' check (tarifa_mensual_moneda in ('PEN','USD')),
  add column garantia_moneda text not null default 'PEN' check (garantia_moneda in ('PEN','USD'));
alter table public.extras_alquiler add column moneda text not null default 'PEN' check (moneda in ('PEN','USD'));
alter table public.promociones_alquiler add column moneda text not null default 'PEN' check (moneda in ('PEN','USD'));
alter table public.tarifas_servicios add column moneda text not null default 'PEN' check (moneda in ('PEN','USD'));
alter table public.rutas_carga_borrador add column moneda text not null default 'PEN' check (moneda in ('PEN','USD'));
grant update(moneda) on public.tarifas_servicios to authenticated;

-- Currency-only changes are audited and invalidate promotions based on the old daily rate.
create or replace function renting_privado.version_tarifa() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.tarifa_version := old.tarifa_version + case
    when new.tarifa_diaria_centimos is distinct from old.tarifa_diaria_centimos
      or new.tarifa_diaria_moneda is distinct from old.tarifa_diaria_moneda then 1 else 0 end;
  return new;
end $$;
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
        'weeklyPerDay', old.tarifa_semanal_dia_moneda, 'monthly', old.tarifa_mensual_moneda, 'deposit', old.garantia_moneda)
    )), '{}'::jsonb);
  end if;
  if TG_OP <> 'DELETE' then
    nueva := nullif(jsonb_strip_nulls(jsonb_build_object(
      'daily', new.tarifa_diaria_centimos,
      'weeklyPerDay', new.tarifa_semanal_dia_centimos,
      'monthly', new.tarifa_mensual_centimos,
      'deposit', new.garantia_centimos,
      'currencies', jsonb_build_object('daily', new.tarifa_diaria_moneda,
        'weeklyPerDay', new.tarifa_semanal_dia_moneda, 'monthly', new.tarifa_mensual_moneda, 'deposit', new.garantia_moneda)
    )), '{}'::jsonb);
  end if;
  if nueva is distinct from anterior then
    insert into renting_privado.historial_tarifas (vehiculo_id, autor, anterior, nueva)
    values (coalesce(new.id, old.id), auth.uid(), anterior, nueva);
  end if;
  return null;
end $$;

create or replace function renting_privado.validar_promocion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  regular integer;
  moneda_regular text;
  version_tarifa bigint;
  ultimo_cambio timestamptz;
  duracion integer := new.fin - new.inicio + 1;
begin
  new.regular_centimos := null;
  new.tarifa_version := null;
  if not new.publicada then return new; end if;
  if new.fin < (now() at time zone 'America/Lima')::date then
    raise exception using errcode='22023', message='La campaña ya venció.';
  end if;
  -- Serializa campañas del mismo vehículo y cambios de su tarifa regular.
  select tarifa_diaria_centimos, tarifa_version, tarifa_diaria_moneda into regular, version_tarifa, moneda_regular
  from public.vehiculos where id = new.vehiculo_id and catalogo_publicado for update;
  if new.moneda is distinct from moneda_regular then
    raise exception using errcode='22023', message='La promoción debe usar la misma moneda que la tarifa diaria regular.';
  end if;
  if regular is null or new.precio_centimos >= regular then
    raise exception using errcode='22023', message='La promoción requiere una tarifa diaria regular mayor y un vehículo publicado.';
  end if;
  select cambiado_en into ultimo_cambio from renting_privado.historial_tarifas
  where vehiculo_id = new.vehiculo_id and ((anterior->>'daily') is distinct from (nueva->>'daily')
    or coalesce(anterior#>>'{currencies,daily}', 'PEN') is distinct from coalesce(nueva#>>'{currencies,daily}', 'PEN'))
  order by cambiado_en desc, id desc limit 1;
  if ultimo_cambio is null or ultimo_cambio >= ((new.inicio::timestamp at time zone 'America/Lima') - duracion * interval '1 day') then
    raise exception using errcode='22023', message='El historial de la tarifa regular es insuficiente para esa vigencia.';
  end if;
  if exists (select 1 from public.promociones_alquiler p where p.vehiculo_id = new.vehiculo_id
    and p.id <> new.id and p.publicada and p.tarifa_version = version_tarifa
    and p.inicio <= new.fin and p.fin >= new.inicio) then
    raise exception using errcode='22023', message='Ya hay una campaña publicada que coincide con esas fechas.';
  end if;
  new.regular_centimos := regular;
  new.tarifa_version := version_tarifa;
  return new;
end $$;

create or replace function public.guardar_promocion_categoria(ficha jsonb, simular boolean) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  campania uuid := (ficha->>'campaignId')::uuid;
  categoria_objetivo text := ficha->>'category';
  categoria_guardada text;
  vehiculos text[];
  esperados text[];
  modelo record;
  resultado jsonb := '[]'::jsonb;
  motivo text;
  fecha_inicio date := (ficha->>'starts')::date;
  fecha_fin date := (ficha->>'ends')::date;
  precio integer := (ficha->>'cents')::integer;
  publicar boolean := simular or (ficha->>'published')::boolean;
begin
  if not renting_privado.es_admin() then raise insufficient_privilege; end if;
  if simular is null or publicar is null or campania is null or categoria_objetivo is null
    or fecha_inicio is null or fecha_fin is null or fecha_fin < fecha_inicio or fecha_fin - fecha_inicio >= 366 then
    raise exception using errcode = '22023', message = 'Revise la categoría y las fechas. La vigencia máxima es de 366 días.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(campania::text, 0));
  select min(p.categoria_campania), array_agg(p.vehiculo_id order by p.vehiculo_id)
    into categoria_guardada, vehiculos
  from public.promociones_alquiler p where p.campania_id = campania;

  if vehiculos is null then
    select array_agg(v.id order by v.id) into vehiculos from public.vehiculos v
    where v.catalogo_publicado and (v.categoria = categoria_objetivo or exists (
      select 1 from public.vehiculo_categorias c where c.vehiculo_id = v.id and c.categoria = categoria_objetivo
    ));
  elsif categoria_guardada is distinct from categoria_objetivo then
    raise exception using errcode = '22023', message = 'La categoría de una campaña guardada no se puede cambiar.';
  end if;

  if vehiculos is null then
    raise exception using errcode = '22023', message = 'La categoría no tiene vehículos publicados.';
  end if;
  esperados := array(select id from jsonb_array_elements_text(ficha->'vehicleIds') as ids(id) order by id);
  if vehiculos is distinct from esperados then
    raise exception using errcode = '22023', message = 'Los vehículos de la campaña cambiaron. Actualice el panel y vuelva a revisar.';
  end if;

  for modelo in
    select v.id, v.nombre from public.vehiculos v where v.id = any(vehiculos) order by v.id for update
  loop
    motivo := null;
    begin
      update public.promociones_alquiler p set nombre = ficha->>'title', texto = ficha->>'banner',
        bases = ficha->>'terms', inicio = fecha_inicio, fin = fecha_fin,
        precio_centimos = precio, publicada = publicar, moneda = coalesce(ficha->>'currency', p.moneda)
      where p.campania_id = campania and p.vehiculo_id = modelo.id;
      if not found then
        insert into public.promociones_alquiler (
          vehiculo_id, campania_id, categoria_campania, nombre, texto, bases, inicio, fin, precio_centimos, publicada, moneda
        ) values (
          modelo.id, campania, categoria_objetivo, ficha->>'title', ficha->>'banner', ficha->>'terms', fecha_inicio, fecha_fin, precio, publicar, coalesce(ficha->>'currency', 'PEN')
        );
      end if;

      -- Reuse the publication trigger during preview, then roll back the write and audit.
      if simular then raise sqlstate 'PRA01'; end if;
    exception
      when sqlstate 'PRA01' then null;
      when invalid_parameter_value then
        if not simular then raise exception using errcode = '22023', message = format('%s: %s', modelo.nombre, sqlerrm); end if;
        motivo := sqlerrm;
    end;
    resultado := resultado || jsonb_build_array(jsonb_build_object('id', modelo.id, 'name', modelo.nombre, 'reason', motivo));
  end loop;

  if jsonb_array_length(resultado) <> cardinality(vehiculos) then
    raise exception using errcode = '22023', message = 'Los vehículos de la campaña cambiaron. Actualice el panel y vuelva a revisar.';
  end if;
  return resultado;
end $$;

commit;
