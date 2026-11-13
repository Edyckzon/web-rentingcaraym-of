begin;
set local lock_timeout = '5s';
create or replace function public.guardar_vehiculo(ficha jsonb) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 if jsonb_typeof(ficha->'images') is distinct from 'array' then raise exception 'Indique una lista de fotografías'; end if;
 if jsonb_array_length(ficha->'images') > 40 then raise exception 'Se permiten hasta 40 fotos'; end if;
 insert into public.vehiculos(id,nombre,categoria,descripcion,destacado)
 values(ficha->>'id',ficha->>'name',ficha->>'category',ficha->>'description',(ficha->>'featured')::boolean)
 on conflict(id) do update set nombre=excluded.nombre,categoria=excluded.categoria,descripcion=excluded.descripcion,destacado=excluded.destacado;
 -- Clientes anteriores conservan los nuevos campos al guardar.
 update public.vehiculos set
 seo_titulo=case when ficha ? 'seoTitle' then coalesce(ficha->>'seoTitle','') else seo_titulo end,
 seo_descripcion=case when ficha ? 'seoDescription' then coalesce(ficha->>'seoDescription','') else seo_descripcion end,
 ideal_para=case when ficha ? 'idealFor' then coalesce(ficha->>'idealFor','') else ideal_para end
 where id=ficha->>'id';
 delete from public.vehiculo_fotos where vehiculo_id=ficha->>'id' and not ((ficha->'images') ? ruta);
 insert into public.vehiculo_fotos(vehiculo_id,ruta,alt,orden)
 select ficha->>'id',src,(ficha->>'name') || ' en alquiler en Lima — Renting Car A&M',n-1
 from jsonb_array_elements_text(ficha->'images') with ordinality as a(src,n)
 on conflict(vehiculo_id,ruta) do update set orden=excluded.orden;
end $$;
commit;
