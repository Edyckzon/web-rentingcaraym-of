begin;
set local lock_timeout='5s';
create table public.servicio_fotos (
 servicio text not null check (servicio in ('excavadora-cat-330dl','volquetes','transporte-de-carga')),
 ruta text not null check (ruta ~ '^https://pjkcihdiasktmwdpcmpt[.]supabase[.]co/storage/v1/object/public/renting-fotos/[a-f0-9]{64}[.](webp|png|jpeg)$'),
 alt text not null check (length(btrim(alt)) between 1 and 200),
 orden integer not null check (orden between 0 and 39),
 primary key (servicio,orden), unique(servicio,ruta)
);
alter table public.servicio_fotos enable row level security;
revoke all on public.servicio_fotos from public,anon,authenticated;
grant select on public.servicio_fotos to anon,authenticated;
grant insert,delete on public.servicio_fotos to authenticated;
create policy lectura on public.servicio_fotos for select to anon,authenticated using(true);
create policy mantenimiento on public.servicio_fotos for all to authenticated
using((select renting_privado.es_admin())) with check((select renting_privado.es_admin()));

create function public.guardar_galeria_servicio(ficha jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare servicio_id text := ficha->>'id';
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 if servicio_id is null or servicio_id not in ('excavadora-cat-330dl','volquetes','transporte-de-carga')
   or jsonb_typeof(ficha->'images') is distinct from 'array' then
   raise exception using errcode='22023',message='Galería no válida.';
 end if;
 if jsonb_array_length(ficha->'images') > 40 then raise exception using errcode='22023',message='Máximo 40 fotos por servicio.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('galeria-servicio:'||servicio_id,0));
 delete from public.servicio_fotos where servicio=servicio_id;
 insert into public.servicio_fotos(servicio,ruta,alt,orden)
 select servicio_id,imagen->>'src',imagen->>'alt',posicion-1
 from jsonb_array_elements(ficha->'images') with ordinality as fotos(imagen,posicion);
end $$;
revoke all on function public.guardar_galeria_servicio(jsonb) from public,anon,authenticated;
grant execute on function public.guardar_galeria_servicio(jsonb) to authenticated;
alter table public.configuracion_web add column requisitos_pdf text
check(requisitos_pdf ~ '^https://pjkcihdiasktmwdpcmpt[.]supabase[.]co/storage/v1/object/public/renting-documentos/[a-f0-9]{64}[.]pdf$');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('renting-documentos','renting-documentos',true,5242880,array['application/pdf']);
create policy documentos_admin_insert on storage.objects for insert to authenticated
with check(bucket_id='renting-documentos' and (select renting_privado.es_admin()));
create policy documentos_admin_update on storage.objects for update to authenticated
using(bucket_id='renting-documentos' and (select renting_privado.es_admin()))
with check(bucket_id='renting-documentos' and (select renting_privado.es_admin()));
create policy documentos_admin_select on storage.objects for select to authenticated
using(bucket_id='renting-documentos' and (select renting_privado.es_admin()));
commit;
