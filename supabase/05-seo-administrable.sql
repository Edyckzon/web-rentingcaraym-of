begin;
alter table public.vehiculos
  add column seo_titulo text not null default '' check(length(seo_titulo)<=160),
  add column seo_descripcion text not null default '' check(length(seo_descripcion)<=320),
  add column ideal_para text not null default '' check(length(ideal_para)<=4000),
  add column actualizado_en timestamptz not null default now();

create table public.paginas_web (
  ruta text primary key check(ruta ~ '^/([a-z0-9-]+/)*$'),
  titulo text not null check(length(titulo) between 1 and 160),
  descripcion text not null check(length(descripcion) between 1 and 320),
  encabezado text not null check(length(encabezado) between 1 and 200),
  introduccion text not null check(length(introduccion)<=1500),
  actualizado_en timestamptz not null default now()
);
alter table public.paginas_web enable row level security;
revoke all on public.paginas_web from public, anon, authenticated;
grant select on public.paginas_web to anon, authenticated;
grant update on public.paginas_web to authenticated;
create policy lectura on public.paginas_web for select to anon, authenticated using(true);
create policy mantenimiento on public.paginas_web for update to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));

create function renting_privado.marcar_actualizacion() returns trigger
language plpgsql set search_path='' as $$
begin
 if new is distinct from old then new.actualizado_en=now(); end if;
 return new;
end $$;
create trigger vehiculos_actualizados before update on public.vehiculos
for each row execute function renting_privado.marcar_actualizacion();
create trigger paginas_actualizadas before update on public.paginas_web
for each row execute function renting_privado.marcar_actualizacion();
revoke all on function renting_privado.marcar_actualizacion() from public,anon,authenticated;

create or replace function public.guardar_vehiculo(ficha jsonb) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 if coalesce(jsonb_array_length(ficha->'images'),0) not between 1 and 40 then raise exception 'Se requieren entre 1 y 40 fotos'; end if;
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
revoke all on function public.guardar_vehiculo(jsonb) from public,anon,authenticated;
grant execute on function public.guardar_vehiculo(jsonb) to authenticated;
commit;
