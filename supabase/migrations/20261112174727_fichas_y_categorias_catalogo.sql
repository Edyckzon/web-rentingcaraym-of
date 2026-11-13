begin;
set local lock_timeout = '5s';

alter table public.vehiculos
  add column ficha_catalogo jsonb check (ficha_catalogo is null or jsonb_typeof(ficha_catalogo) = 'object'),
  add column catalogo_publicado boolean not null default true;

create table public.vehiculo_categorias (
  vehiculo_id text not null references public.vehiculos(id) on delete cascade,
  categoria text not null references public.categorias(nombre) on update cascade on delete restrict,
  primary key (vehiculo_id, categoria)
);
create index vehiculo_categorias_categoria_idx on public.vehiculo_categorias (categoria);
alter table public.vehiculo_categorias enable row level security;
revoke all on public.vehiculo_categorias from public, anon, authenticated;
grant select on public.vehiculo_categorias to anon, authenticated;
grant insert, delete on public.vehiculo_categorias to authenticated;

drop policy lectura on public.vehiculos;
create policy lectura on public.vehiculos for select to anon, authenticated using (catalogo_publicado);
create policy lectura on public.vehiculo_categorias for select to anon, authenticated
using (exists (select 1 from public.vehiculos where id = vehiculo_id));
create policy mantenimiento on public.vehiculo_categorias for all to authenticated
using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()));

create function public.guardar_ficha_catalogo(ficha jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  modelo text := ficha->>'id';
  publicar boolean := (ficha->>'published')::boolean;
begin
  if not renting_privado.es_admin() then raise insufficient_privilege; end if;
  if publicar and coalesce((ficha->'profile'->>'year')::integer, 0) not between 1900 and 2100 then
    raise exception 'Indique el año confirmado antes de publicar';
  end if;
  update public.vehiculos set ficha_catalogo = ficha->'profile', catalogo_publicado = publicar where id = modelo;
  if not found then raise no_data_found; end if;
  if (ficha->'categories') ? 'Pickup 4x4' then
    insert into public.categorias(nombre) values ('Pickup 4x4') on conflict do nothing;
  end if;
  delete from public.vehiculo_categorias where vehiculo_id = modelo;
  insert into public.vehiculo_categorias(vehiculo_id, categoria)
  select distinct modelo, categoria from jsonb_array_elements_text(ficha->'categories') as c(categoria);
end $$;
revoke all on function public.guardar_ficha_catalogo(jsonb) from public, anon, authenticated;
grant execute on function public.guardar_ficha_catalogo(jsonb) to authenticated;

create function public.guardar_vehiculo_catalogo(ficha jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  modelo text := ficha->>'id';
  nuevo boolean;
begin
  if not renting_privado.es_admin() then raise insufficient_privilege; end if;
  perform pg_advisory_xact_lock(hashtext(modelo));
  select not exists(select 1 from public.vehiculos where id = modelo) into nuevo;
  perform public.guardar_vehiculo(ficha);
  if nuevo then update public.vehiculos set catalogo_publicado = false where id = modelo; end if;
end $$;
revoke all on function public.guardar_vehiculo_catalogo(jsonb) from public, anon, authenticated;
grant execute on function public.guardar_vehiculo_catalogo(jsonb) to authenticated;

commit;
