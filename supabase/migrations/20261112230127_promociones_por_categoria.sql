begin;
set local lock_timeout = '5s';

alter table public.promociones_alquiler
  add column campania_id uuid,
  add column categoria_campania text,
  add constraint promociones_categoria_campania_check check (
    (campania_id is null and categoria_campania is null)
    or (campania_id is not null and categoria_campania is not null and length(btrim(categoria_campania)) between 1 and 60)
  );
create unique index promociones_campania_vehiculo_idx on public.promociones_alquiler(campania_id, vehiculo_id)
where campania_id is not null;

create function public.guardar_promocion_categoria(ficha jsonb, simular boolean) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  campania uuid := (ficha->>'campaignId')::uuid;
  categoria text := ficha->>'category';
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
  if simular is null or publicar is null or campania is null or categoria is null
    or fecha_inicio is null or fecha_fin is null or fecha_fin < fecha_inicio or fecha_fin - fecha_inicio >= 366 then
    raise exception using errcode = '22023', message = 'Revise la categoría y las fechas. La vigencia máxima es de 366 días.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(campania::text, 0));
  select min(p.categoria_campania), array_agg(p.vehiculo_id order by p.vehiculo_id)
    into categoria_guardada, vehiculos
  from public.promociones_alquiler p where p.campania_id = campania;

  if vehiculos is null then
    select array_agg(v.id order by v.id) into vehiculos from public.vehiculos v
    where v.catalogo_publicado and (v.categoria = categoria or exists (
      select 1 from public.vehiculo_categorias c where c.vehiculo_id = v.id and c.categoria = categoria
    ));
  elsif categoria_guardada is distinct from categoria then
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
        precio_centimos = precio, publicada = publicar
      where p.campania_id = campania and p.vehiculo_id = modelo.id;
      if not found then
        insert into public.promociones_alquiler (
          vehiculo_id, campania_id, categoria_campania, nombre, texto, bases, inicio, fin, precio_centimos, publicada
        ) values (
          modelo.id, campania, categoria, ficha->>'title', ficha->>'banner', ficha->>'terms', fecha_inicio, fecha_fin, precio, publicar
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

revoke all on function public.guardar_promocion_categoria(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.guardar_promocion_categoria(jsonb, boolean) to authenticated;

commit;
