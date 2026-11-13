begin;
set local lock_timeout = '5s';

alter table public.vehiculos add column tarifa_version bigint not null default 0;
create function renting_privado.version_tarifa() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.tarifa_version := old.tarifa_version + case
    when new.tarifa_diaria_centimos is distinct from old.tarifa_diaria_centimos then 1 else 0 end;
  return new;
end $$;
create trigger version_tarifa before update on public.vehiculos
for each row execute function renting_privado.version_tarifa();

create table public.reglas_alquiler (
  id integer primary key default 1 check (id = 1),
  semanal_desde integer not null default 7 check (semanal_desde between 2 and 90),
  mensual_desde integer not null default 30 check (mensual_desde between 3 and 180),
  dias_prorrateo integer not null default 30 check (dias_prorrateo between 1 and 366),
  acumular boolean not null default false,
  check (mensual_desde > semanal_desde)
);
insert into public.reglas_alquiler default values;
create table public.extras_alquiler (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(btrim(nombre)) between 1 and 100),
  precio_centimos integer not null check (precio_centimos between 0 and 100000000),
  activo boolean not null default false
);
create table public.promociones_alquiler (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id text not null references public.vehiculos(id) on delete cascade,
  nombre text not null check (length(btrim(nombre)) between 1 and 100),
  texto text not null default '' check (length(texto) <= 200),
  bases text not null check (length(btrim(bases)) between 1 and 4000),
  inicio date not null,
  fin date not null,
  precio_centimos integer not null check (precio_centimos between 1 and 100000000),
  regular_centimos integer,
  tarifa_version bigint,
  publicada boolean not null default false,
  check (fin >= inicio and fin - inicio < 366)
);
create index promociones_vehiculo_fechas_idx on public.promociones_alquiler(vehiculo_id, inicio, fin);

create function renting_privado.validar_promocion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  regular integer;
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
  select tarifa_diaria_centimos, tarifa_version into regular, version_tarifa
  from public.vehiculos where id = new.vehiculo_id and catalogo_publicado for update;
  if regular is null or new.precio_centimos >= regular then
    raise exception using errcode='22023', message='La promoción requiere una tarifa diaria regular mayor y un vehículo publicado.';
  end if;
  select cambiado_en into ultimo_cambio from renting_privado.historial_tarifas
  where vehiculo_id = new.vehiculo_id and (anterior->>'daily') is distinct from (nueva->>'daily')
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
revoke all on function renting_privado.validar_promocion() from public, anon, authenticated;
create trigger validar_promocion before insert or update on public.promociones_alquiler
for each row execute function renting_privado.validar_promocion();

alter table public.reglas_alquiler enable row level security;
alter table public.extras_alquiler enable row level security;
alter table public.promociones_alquiler enable row level security;
revoke all on public.reglas_alquiler, public.extras_alquiler, public.promociones_alquiler from public, anon, authenticated;
grant select on public.reglas_alquiler, public.extras_alquiler, public.promociones_alquiler to anon, authenticated;
grant update on public.reglas_alquiler to authenticated;
grant insert, update, delete on public.extras_alquiler, public.promociones_alquiler to authenticated;
create policy lectura on public.reglas_alquiler for select to anon, authenticated using (true);
create policy mantenimiento on public.reglas_alquiler for update to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));
create policy lectura on public.extras_alquiler for select to anon, authenticated using (activo);
create policy mantenimiento on public.extras_alquiler for all to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));
create policy lectura on public.promociones_alquiler for select to anon, authenticated
using (publicada and (now() at time zone 'America/Lima')::date between inicio and fin
  and exists (select 1 from public.vehiculos v where v.id = vehiculo_id and v.catalogo_publicado and v.tarifa_version = promociones_alquiler.tarifa_version));
create policy mantenimiento on public.promociones_alquiler for all to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));

create function public.historial_tarifas_admin() returns setof jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not renting_privado.es_admin() then raise insufficient_privilege; end if;
  return query select to_jsonb(h) from renting_privado.historial_tarifas h order by cambiado_en desc, id desc limit 10000;
end $$;
revoke all on function public.historial_tarifas_admin() from public, anon, authenticated;
grant execute on function public.historial_tarifas_admin() to authenticated;

create table renting_privado.solicitudes_alquiler (
  id uuid primary key,
  creado_en timestamptz not null default now(),
  vehiculo_id text not null,
  nombre text not null check (length(btrim(nombre)) between 1 and 100),
  telefono text not null check (length(telefono) between 7 and 25),
  correo text not null check (length(correo) <= 160),
  documento text not null check (length(documento) <= 20),
  comentario text not null check (length(comentario) <= 1200),
  detalle jsonb not null check (jsonb_typeof(detalle) = 'object'),
  notificado_en timestamptz
);
create index solicitudes_alquiler_creadas_idx on renting_privado.solicitudes_alquiler(creado_en desc);
alter table renting_privado.solicitudes_alquiler enable row level security;
revoke all on renting_privado.solicitudes_alquiler from public, anon, authenticated;

create function public.recibir_solicitud_alquiler(ficha jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  solicitud uuid := (ficha->>'id')::uuid;
  guardada renting_privado.solicitudes_alquiler%rowtype;
begin
  insert into renting_privado.solicitudes_alquiler(id, vehiculo_id, nombre, telefono, correo, documento, comentario, detalle)
  values (solicitud, ficha->>'vehicleId', ficha->>'name', ficha->>'phone', ficha->>'email', ficha->>'document', ficha->>'comment', ficha->'quote')
  on conflict(id) do nothing;
  select * into strict guardada from renting_privado.solicitudes_alquiler where id = solicitud;
  if guardada.vehiculo_id <> ficha->>'vehicleId' or guardada.telefono <> ficha->>'phone' then
    raise exception using errcode='23505', message='Este identificador ya corresponde a otra solicitud';
  end if;
  return guardada.notificado_en is not null;
end $$;

create function public.solicitud_alquiler_notificada(solicitud uuid) returns void
language sql security definer set search_path = '' as $$
  update renting_privado.solicitudes_alquiler set notificado_en=now() where id=solicitud and notificado_en is null;
$$;

create function public.solicitudes_alquiler_admin() returns setof jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not renting_privado.es_admin() then raise insufficient_privilege; end if;
  return query select to_jsonb(s) from renting_privado.solicitudes_alquiler s order by creado_en desc limit 200;
end $$;

revoke all on function public.recibir_solicitud_alquiler(jsonb), public.solicitud_alquiler_notificada(uuid), public.solicitudes_alquiler_admin() from public, anon, authenticated;
grant execute on function public.recibir_solicitud_alquiler(jsonb), public.solicitud_alquiler_notificada(uuid) to service_role;
grant execute on function public.solicitudes_alquiler_admin() to authenticated;

create table public.rutas_carga_borrador (
  id uuid primary key default gen_random_uuid(),
  origen text not null check (length(btrim(origen)) between 1 and 100),
  destino text not null check (length(btrim(destino)) between 1 and 100),
  descripcion text not null default '' check (length(descripcion) <= 4000),
  tiempo_estimado text not null default '' check (length(tiempo_estimado) <= 100),
  precio_centimos integer check (precio_centimos between 1 and 100000000),
  unique (origen, destino)
);
alter table public.rutas_carga_borrador enable row level security;
revoke all on public.rutas_carga_borrador from public, anon, authenticated;
grant select, insert, update on public.rutas_carga_borrador to authenticated;
create policy mantenimiento on public.rutas_carga_borrador for all to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));

commit;
