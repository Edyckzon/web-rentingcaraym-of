begin;
set local lock_timeout='5s';
create table public.menu_web (
 id text primary key check(id ~ '^[a-z0-9-]{1,100}$'),
 padre text references public.menu_web(id) on delete restrict,
 etiqueta text not null check(length(btrim(etiqueta)) between 1 and 80),
 destino text check(length(destino)<=2048 and (left(destino,1)='/' and left(destino,2)<>'//' or left(destino,8)='https://') and destino !~ '[[:space:]]' and position(chr(92) in destino)=0),
 orden integer not null check(orden between 0 and 10000), visible boolean not null default true,
 check(padre is null or destino is not null), check(padre is distinct from id)
);
create index menu_padre_orden on public.menu_web(padre,orden,id);
create table public.servicios_web (
 id text primary key check(id in ('empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga')),
 nombre text not null check(length(btrim(nombre)) between 1 and 100),
 equipo text not null check(length(btrim(equipo)) between 1 and 100),
 descripcion text not null check(length(btrim(descripcion)) between 1 and 4000),
 aplicaciones text[] not null default '{}', datos_cotizacion text[] not null default '{}',
 mensaje_whatsapp text not null check(length(btrim(mensaje_whatsapp)) between 1 and 2000),
 guia_titulo text not null check(length(btrim(guia_titulo)) between 1 and 200),
 guia_intro text not null check(length(btrim(guia_intro)) between 1 and 1500),
 condiciones text not null check(length(btrim(condiciones)) between 1 and 4000),
 check(cardinality(aplicaciones)<=20 and length(array_to_string(aplicaciones,''))<=4000),
 check(cardinality(datos_cotizacion)<=20 and length(array_to_string(datos_cotizacion,''))<=4000)
);
alter table public.menu_web enable row level security;
revoke all on public.menu_web from public,anon,authenticated;
grant select on public.menu_web to anon,authenticated;
grant insert,update,delete on public.menu_web to authenticated;
create policy lectura on public.menu_web for select to anon,authenticated using(true);
create policy mantenimiento on public.menu_web for all to authenticated using((select renting_privado.es_admin())) with check((select renting_privado.es_admin()));
alter table public.servicios_web enable row level security;
revoke all on public.servicios_web from public,anon,authenticated;
grant select on public.servicios_web to anon,authenticated;
grant insert,update,delete on public.servicios_web to authenticated;
create policy lectura on public.servicios_web for select to anon,authenticated using(true);
create policy mantenimiento on public.servicios_web for all to authenticated using((select renting_privado.es_admin())) with check((select renting_privado.es_admin()));
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-01',null,'Inicio','/',0);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('flota',null,'Flota',null,10);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-02','flota','Ver toda la flota','/flota/',20);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-03','flota','Camionetas SUV','/flota/suv/',30);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-04','flota','Pickups 4x4','/flota/pickup-4x4/',40);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-05','flota','Familiares de 7 asientos','/flota/7-asientos/',50);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-06','flota','Sedanes','/flota/sedan/',60);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-07','flota','Autos a GLP','/alquiler-de-autos-glp/',70);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-08',null,'Tarifario','/tarifario/',80);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-09',null,'Promociones','/promociones/',90);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('servicios',null,'Servicios',null,100);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-10','servicios','Alquiler para empresas','/alquiler-para-empresas/',110);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-11','servicios','Maquinaria y transporte','/maquinaria-y-transporte/',120);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-12','servicios','Excavadora CAT 330DL','/maquinaria-y-transporte/excavadora-cat-330dl/',130);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-13','servicios','Alquiler de volquetes','/maquinaria-y-transporte/volquetes/',140);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-14','servicios','Transporte de carga','/maquinaria-y-transporte/transporte-de-carga/',150);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('ayuda',null,'Ayuda',null,160);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-15','ayuda','Cómo funciona','/como-funciona/',170);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-16','ayuda','Requisitos de alquiler','/requisitos/',180);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-17','ayuda','Nosotros','/nosotros/',190);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-18','ayuda','Contacto','/contacto/',200);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-19','ayuda','Libro de Reclamaciones','/libro-de-reclamaciones/',210);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-20','ayuda','Privacidad','/politica-de-privacidad/',220);
insert into public.menu_web(id,padre,etiqueta,destino,orden) values('link-21','ayuda','Términos y condiciones','/terminos-y-condiciones/',230);
insert into public.servicios_web(id,nombre,equipo,descripcion,aplicaciones,datos_cotizacion,mensaje_whatsapp,guia_titulo,guia_intro,condiciones) values('empresas','Alquiler para empresas','Movilidad empresarial','Coordine la cantidad de unidades y el plazo de alquiler para su equipo.',array[]::text[],array[]::text[],'Hola, deseo cotizar un alquiler para empresas.','Alquiler para empresas','Para evaluar su servicio, comparta esta información:','Consulte capacidad del equipo, operador o conductor, combustible, movilización y modalidad de contratación. Las condiciones se acuerdan en su cotización.');
insert into public.servicios_web(id,nombre,equipo,descripcion,aplicaciones,datos_cotizacion,mensaje_whatsapp,guia_titulo,guia_intro,condiciones) values('maquinaria-y-transporte','Maquinaria y transporte','Línea pesada','Excavadora CAT 330DL, volquetes y transporte de carga en Lima. Consulte operador, movilización y condiciones para su proyecto.',array[]::text[],array[]::text[],'Hola, deseo cotizar maquinaria o transporte de carga.','Maquinaria y transporte','Para evaluar su servicio, comparta esta información:','Consulte capacidad del equipo, operador o conductor, combustible, movilización y modalidad de contratación. Las condiciones se acuerdan en su cotización.');
insert into public.servicios_web(id,nombre,equipo,descripcion,aplicaciones,datos_cotizacion,mensaje_whatsapp,guia_titulo,guia_intro,condiciones) values('excavadora-cat-330dl','Alquiler de excavadora','CAT 330DL','Maquinaria para sus proyectos de excavación y movimiento de tierras. Cuéntenos el trabajo y la ubicación de su obra para preparar una propuesta.',array['Excavación y zanjas','Movimiento de tierras','Carga de volquetes']::text[],array['Ubicación y acceso a la obra','Tipo de trabajo y accesorios requeridos','Fecha de inicio y duración estimada','Necesidad de operador y movilización']::text[],'Hola, deseo cotizar el alquiler de la excavadora CAT 330DL. Quisiera coordinar la obra, fecha de inicio y disponibilidad de operador.','Excavadora para movimiento de tierras','Para evaluar su servicio, comparta esta información:','Consulte capacidad del equipo, operador o conductor, combustible, movilización y modalidad de contratación. Las condiciones se acuerdan en su cotización.');
insert into public.servicios_web(id,nombre,equipo,descripcion,aplicaciones,datos_cotizacion,mensaje_whatsapp,guia_titulo,guia_intro,condiciones) values('volquetes','Alquiler de volquetes','Volquetes','Solicite volquetes para el traslado de materiales y apoyo a su obra. Indique el volumen, el tipo de material y el recorrido requerido.',array['Eliminación de desmonte','Traslado de agregados','Apoyo a obras']::text[],array['Tipo y volumen de material','Cantidad de unidades requerida','Origen, destino y acceso a la obra','Fecha de inicio y duración estimada']::text[],'Hola, deseo cotizar el alquiler de volquetes. Quisiera indicar la cantidad de unidades, el material y la ubicación de la obra.','Volquetes para desmonte y agregados','Para evaluar su servicio, comparta esta información:','Consulte capacidad del equipo, operador o conductor, combustible, movilización y modalidad de contratación. Las condiciones se acuerdan en su cotización.');
insert into public.servicios_web(id,nombre,equipo,descripcion,aplicaciones,datos_cotizacion,mensaje_whatsapp,guia_titulo,guia_intro,condiciones) values('transporte-de-carga','Transporte de carga','Volvo y Scania','Transporte con camiones y tractos Volvo y Scania. Comparta las características de su carga y la ruta para evaluar el servicio que necesita.',array['Carga general','Mercancías','Materiales de construcción']::text[],array['Origen y destino','Tipo, peso y dimensiones de la carga','Fecha de traslado','Condiciones de carga y descarga']::text[],'Hola, deseo cotizar un transporte de carga con camiones Volvo y Scania. Quisiera coordinar origen, destino y tipo de carga.','Camiones Volvo y Scania para carga en Lima','Para evaluar su servicio, comparta esta información:','Consulte capacidad del equipo, operador o conductor, combustible, movilización y modalidad de contratación. Las condiciones se acuerdan en su cotización.');
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('about-main','Nosotros','Empresa','Empresa de alquiler de vehículos y maquinaria en Santiago de Surco','Reunimos dos líneas de servicio: vehículos livianos para movilidad personal y corporativa, y maquinaria y transporte para las necesidades de su proyecto.

Desde nuestra sede en Santiago de Surco, coordinamos con usted las características del servicio, la disponibilidad y las condiciones de cada cotización.','Explore nuestros servicios','/maquinaria-y-transporte/',500) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('about-workshop','Nosotros','Taller','Taller propio en Surco.','Contamos con un taller de reparación en la misma sede. Consulte con nuestro equipo sobre la atención de su vehículo.','Cómo llegar','',501) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('home-fleet','Inicio','Flota destacada','Autos y camionetas en alquiler en Lima','Consulte la disponibilidad, versión y características de cada unidad.','Ver toda la flota','/flota/',502) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('home-company','Inicio','Servicio de empresas','Alquiler para empresas','Coordine la cantidad de unidades y el plazo de alquiler para su equipo.','Ver opciones','/alquiler-para-empresas/',503) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('home-machinery','Inicio','Servicio de maquinaria','Maquinaria pesada','Consulte excavadora y volquetes para su obra, ubicación y fechas.','Ver servicios','/maquinaria-y-transporte/',504) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('home-freight','Inicio','Servicio de carga','Transporte de carga','Indique origen, destino y características de la carga para evaluar el servicio.','Consultar transporte','/maquinaria-y-transporte/transporte-de-carga/',505) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('company-01','Empresas','Propuesta','Una propuesta para su operación','Indique cuántas unidades necesita, las fechas y el uso previsto. Coordinamos la disponibilidad y las condiciones para su equipo.','','',506) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('company-02','Empresas','Plazos','Plazos según su proyecto','Comparta la duración estimada del servicio para evaluar las modalidades disponibles y preparar su cotización.','','',507) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('company-03','Empresas','Taller','Taller propio en Surco','Contamos con taller de reparación en nuestra sede de Santiago de Surco. Consulte la coordinación del mantenimiento de las unidades.','','',508) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('company-04','Empresas','Atención','Atención directa','Converse con nuestro equipo sobre requisitos, documentación y condiciones de contratación para su empresa.','','',509) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('contact-form','Contacto','Presentación del formulario','Cuéntenos qué necesita','Complete los datos para preparar su consulta por WhatsApp.','','',510) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('privacy-request','Privacidad','Solicitudes de llamada','Solicitudes de llamada','Al enviar una solicitud desde una ficha, guardamos los datos de contacto, los datos opcionales que ingresó y la cotización para que el equipo autorizado de A&M atienda su consulta. El formulario usa Cloudflare Turnstile para verificar el envío.','','',511) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('privacy-analytics','Privacidad','Analítica','Cookies de analítica','Si acepta la analítica, medimos páginas visitadas y acciones de cotización mediante Google Tag Manager y Google Analytics. Puede cambiar su elección con el botón Cookies.','','',512) on conflict(id) do nothing;
insert into public.bloques_web(id,grupo,etiqueta,titulo,cuerpo,enlace_texto,enlace_url,orden) values('tariff-intro','Tarifario','Descripción','Tarifario de alquiler','Compare los precios por modelo y duración. Cada tarifa indica su moneda: soles (S/) o dólares (US$). Los importes incluyen IGV.','','',513) on conflict(id) do nothing;
insert into public.paginas_web(ruta,titulo,descripcion,encabezado,introduccion) values('/requisitos/','Requisitos para alquilar un auto en Lima','Revise documentación, garantía, coberturas y condiciones antes de alquilar un vehículo con Renting Car A&M.','Requisitos para alquilar un auto en Lima','Revise documentación, garantía, coberturas y condiciones antes de alquilar un vehículo con Renting Car A&M.') on conflict(ruta) do nothing;
insert into public.paginas_web(ruta,titulo,descripcion,encabezado,introduccion) values('/alquiler-de-autos-glp/','Alquiler de autos a GLP en Lima','Compare modelos bicombustibles y consulte qué unidad está disponible para sus fechas, recorrido y lugar de recojo.','Alquiler de autos a GLP en Lima','Compare modelos bicombustibles y consulte qué unidad está disponible para sus fechas, recorrido y lugar de recojo.') on conflict(ruta) do nothing;
insert into public.paginas_web(ruta,titulo,descripcion,encabezado,introduccion) values('/tarifario/','Tarifario de alquiler','Compare los precios por modelo y duración. Cada tarifa indica su moneda: soles (S/) o dólares (US$). Los importes incluyen IGV.','Tarifario de alquiler','Compare los precios por modelo y duración. Cada tarifa indica su moneda: soles (S/) o dólares (US$). Los importes incluyen IGV.') on conflict(ruta) do nothing;
insert into public.paginas_web(ruta,titulo,descripcion,encabezado,introduccion) values('/promociones/','Promociones de alquiler','Consulte las promociones vigentes y sus condiciones antes de reservar.','Promociones de alquiler','Consulte las promociones vigentes y sus condiciones antes de reservar.') on conflict(ruta) do nothing;
alter table public.servicio_fotos drop constraint servicio_fotos_servicio_check;
alter table public.servicio_fotos add constraint servicio_fotos_servicio_check check(servicio in ('empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga'));
alter table public.tarifas_servicios drop constraint tarifas_servicios_servicio_check;
alter table public.tarifas_servicios add constraint tarifas_servicios_servicio_check check(servicio in ('empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga'));
insert into public.tarifas_servicios(servicio) values('maquinaria-y-transporte'),('transporte-de-carga') on conflict(servicio) do nothing;
alter table public.tarifas_servicios
 add column alternativa_centimos integer check(alternativa_centimos between 1 and 100000000),
 add column alternativa_modo text not null default 'tc' check(alternativa_modo in ('manual','tc')),
 add constraint alternativa_completa check(alternativa_modo<>'manual' or precio_centimos is null or alternativa_centimos is not null);
grant update(alternativa_centimos,alternativa_modo) on public.tarifas_servicios to authenticated;
alter table public.configuracion_web add column mapa_url text, add column video_url text not null default '/brand/journey/renting-aym-gemini.mp4';
create or replace function public.guardar_galeria_servicio(ficha jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare servicio_id text := ficha->>'id';
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 if servicio_id is null or servicio_id not in ('empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga')
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

create function public.guardar_enlace_menu(ficha jsonb) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not renting_privado.es_admin() then raise insufficient_privilege; end if;
 perform pg_advisory_xact_lock(hashtextextended('menu-web',0));
 if ficha->>'padre' is not null and not exists(select 1 from public.menu_web where id=ficha->>'padre' and padre is null and destino is null) then
   raise exception using errcode='22023',message='Elija un grupo principal válido.';
 end if;
 if exists(select 1 from public.menu_web where padre=ficha->>'id') and (ficha->>'destino' is not null or ficha->>'padre' is not null) then
   raise exception using errcode='22023',message='Mueva los enlaces del grupo antes de cambiar su tipo.';
 end if;
 insert into public.menu_web(id,padre,etiqueta,destino,orden,visible)
 values(ficha->>'id',ficha->>'padre',ficha->>'etiqueta',ficha->>'destino',(ficha->>'orden')::integer,(ficha->>'visible')::boolean)
 on conflict(id) do update set padre=excluded.padre,etiqueta=excluded.etiqueta,destino=excluded.destino,orden=excluded.orden,visible=excluded.visible;
end $$;
revoke all on function public.guardar_enlace_menu(jsonb) from public,anon,authenticated;
grant execute on function public.guardar_enlace_menu(jsonb) to authenticated;
commit;
