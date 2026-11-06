-- Incremental: ejecutar después de 01 y 02. No elimina vehículos ni fotografías.
begin;
create table if not exists public.categorias (
 nombre text primary key check (nombre = btrim(nombre) and length(nombre) between 1 and 60 and lower(nombre) <> 'todos')
);
create unique index if not exists categorias_nombre_unico on public.categorias(lower(nombre));
insert into public.categorias(nombre) select distinct categoria from public.vehiculos on conflict do nothing;
alter table public.categorias enable row level security;
revoke all on public.categorias from public, anon, authenticated;
grant select on public.categorias to anon, authenticated;
grant insert,update,delete on public.categorias to authenticated;
drop policy if exists lectura on public.categorias;
create policy lectura on public.categorias for select to anon,authenticated using(true);
drop policy if exists mantenimiento on public.categorias;
create policy mantenimiento on public.categorias for all to authenticated using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));
alter table public.vehiculos drop constraint if exists vehiculos_categoria_check;
alter table public.vehiculos drop constraint if exists vehiculos_categoria_fk;
alter table public.vehiculos add constraint vehiculos_categoria_fk foreign key(categoria) references public.categorias(nombre) on update cascade on delete restrict;
create or replace function public.renting_admin() returns boolean language sql stable security invoker set search_path='' as $$
 select renting_privado.es_admin()
$$;
create or replace function public.guardar_vehiculo(ficha jsonb) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 if coalesce(jsonb_array_length(ficha->'images'),0) not between 1 and 40 then raise exception 'Se requieren entre 1 y 40 fotos'; end if;
 insert into public.vehiculos(id,nombre,categoria,descripcion,destacado) values(ficha->>'id',ficha->>'name',ficha->>'category',ficha->>'description',(ficha->>'featured')::boolean)
 on conflict(id) do update set nombre=excluded.nombre,categoria=excluded.categoria,descripcion=excluded.descripcion,destacado=excluded.destacado;
 delete from public.vehiculo_fotos where vehiculo_id=ficha->>'id' and not ((ficha->'images') ? ruta);
 insert into public.vehiculo_fotos(vehiculo_id,ruta,alt,orden)
 select ficha->>'id',src,ficha->>'name',n-1 from jsonb_array_elements_text(ficha->'images') with ordinality as a(src,n)
 on conflict(vehiculo_id,ruta) do update set orden=excluded.orden;
end $$;
-- Cambia únicamente las referencias confirmadas, conservando créditos, IDs y orden.
create or replace function public.migrar_foto(anterior text,nueva text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 if anterior not like '/images/%' or nueva not like 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/%' then raise exception 'Ruta no válida'; end if;
 update public.vehiculo_fotos set ruta=nueva where ruta=anterior;
 update public.configuracion_web set portada=nueva where portada=anterior;
end $$;
revoke all on function public.renting_admin(),public.guardar_vehiculo(jsonb),public.migrar_foto(text,text) from public,anon,authenticated;
grant execute on function public.renting_admin(),public.guardar_vehiculo(jsonb),public.migrar_foto(text,text) to authenticated;
commit;
