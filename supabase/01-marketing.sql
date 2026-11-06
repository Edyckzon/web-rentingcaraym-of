-- Ejecutar UNA vez en SQL Editor de AdminWeb Renting. Todo o nada.
-- Solo contiene información publicable. Las cuentas se crean en Authentication > Users.
begin;
create schema renting_privado;
revoke all on schema renting_privado from public, anon, authenticated;
create table renting_privado.administradores (
  usuario uuid primary key references auth.users(id) on delete cascade
);
revoke all on renting_privado.administradores from public, anon, authenticated;
create function renting_privado.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from renting_privado.administradores where usuario = (select auth.uid()))
$$;
revoke all on function renting_privado.es_admin() from public, anon, authenticated;
grant usage on schema renting_privado to authenticated;
grant execute on function renting_privado.es_admin() to authenticated;

create table public.vehiculos (
  id text primary key check(id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  nombre text not null check(length(trim(nombre)) between 1 and 100),
  categoria text not null check(categoria in ('SUV','Sedán','Familiar / 7 asientos')),
  descripcion text not null, destacado boolean not null default false
);
create table public.vehiculo_fotos (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id text not null references public.vehiculos(id) on delete cascade,
  ruta text not null, alt text not null, orden integer not null check(orden>=0),
  referencial boolean not null default false, credito text, fuente text, licencia text, enlace_licencia text,
  unique(vehiculo_id,orden) deferrable initially deferred, unique(vehiculo_id,ruta)
);
comment on column public.vehiculo_fotos.orden is 'La foto con menor orden es la principal.';
create table public.configuracion_web (
  id integer primary key default 1 check(id=1),
  titulo text not null, destacado text not null, eslogan text not null, portada text not null,
  boton_1 text not null, destino_1 text not null, boton_2 text not null, destino_2 text not null,
  telefono text not null, whatsapp text not null, maps text not null, waze text not null
);
do $$
declare t text;
begin
  foreach t in array array['vehiculos','vehiculo_fotos','configuracion_web'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
    execute format('grant select on table public.%I to anon, authenticated',t);
    execute format('grant insert, update, delete on table public.%I to authenticated',t);
    execute format('create policy lectura on public.%I for select to anon, authenticated using (true)',t);
    execute format('create policy mantenimiento on public.%I for all to authenticated using ((select renting_privado.es_admin())) with check ((select renting_privado.es_admin()))',t);
  end loop;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('renting-fotos','renting-fotos',true,5242880,array['image/webp','image/jpeg','image/png']);
create policy renting_fotos_admin on storage.objects for all to authenticated
using (bucket_id='renting-fotos' and (select renting_privado.es_admin()))
with check (bucket_id='renting-fotos' and (select renting_privado.es_admin()));

-- Catálogo inicial. Las fotos existentes se sirven desde el bucket renting-fotos.
insert into public.vehiculos (id,nombre,categoria,descripcion,destacado) values
  ('ford-territory', 'Ford Territory', 'SUV', 'Solicite una cotización para el alquiler de Ford Territory. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', true),
  ('changan-x7-plus', 'Changan X7 Plus', 'SUV', 'Solicite una cotización para el alquiler de Changan X7 Plus. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', true),
  ('changan-cx70', 'Changan CX70', 'SUV', 'Solicite una cotización para el alquiler de Changan CX70. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', true),
  ('jetur-x70', 'Jetour X70', 'SUV', 'Solicite una cotización para el alquiler de Jetour X70. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', true),
  ('glory-580', 'Glory 580', 'SUV', 'Solicite una cotización para el alquiler de Glory 580. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', false),
  ('glory-560', 'Glory 560', 'SUV', 'Solicite una cotización para el alquiler de Glory 560. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', false),
  ('jac-s8', 'JAC JS8', 'SUV', 'Solicite una cotización para el alquiler de JAC JS8. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', false),
  ('toyota-yaris', 'Toyota Yaris', 'Sedán', 'Solicite una cotización para el alquiler de Toyota Yaris. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', true),
  ('hyundai-verna', 'Hyundai Verna', 'Sedán', 'Solicite una cotización para el alquiler de Hyundai Verna. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', false),
  ('hyundai-accent', 'Hyundai Accent', 'Sedán', 'Solicite una cotización para el alquiler de Hyundai Accent. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', false),
  ('changan-alsvin', 'Changan Alsvin', 'Sedán', 'Solicite una cotización para el alquiler de Changan Alsvin. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', false),
  ('suzuki-ertiga', 'Suzuki Ertiga', 'Familiar / 7 asientos', 'Solicite una cotización para el alquiler de Suzuki Ertiga. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.', true);
insert into public.vehiculo_fotos (vehiculo_id,ruta,alt,orden,referencial,credito,fuente,licencia,enlace_licencia) values
  ('ford-territory', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/f341b08ca4143296a7bea8805e9b3bea7c9b4b70c2732958df09b84c99f34a56.jpeg', '2023 Ford Territory (China), front 8.3.23', 0, true, 'Kevauto', 'https://commons.wikimedia.org/wiki/File:2023_Ford_Territory_(China),_front_8.3.23.jpg', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0'),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/6c2266d0eebd583289925363b32ec32e4d542173465a28c2a6aa7a07a554cac9.png', 'Changan X7 Plus gris de Renting Car A&M, vista frontal de tres cuartos', 0, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/6b7d739a5f4b95776b394e6e778f51ca472f2606693d4fcb856d53656d1cd2b4.png', 'Changan X7 Plus gris, vista frontal desde el lado opuesto', 1, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/a9e316b7865396cb75858ce3766dcf99c65b0c5780f0381467a1a2d35ad7d597.png', 'Changan X7 Plus, detalle de la parte posterior', 2, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/a698c00a09564d542886b0ce2625ef77380f6a1bbf47a349dec1e4c00e620123.png', 'Changan X7 Plus, rueda y aro de aleación', 3, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/5e37116e5c65db01de02346bd8e93da226fb7edbbdd62e83afd62035402ab04f.png', 'Changan X7 Plus, volante y tablero', 4, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/2583f2ea934785fa6b5b1d655bbdec579c56a4527ddb2e34833db90c1279fe6f.png', 'Changan X7 Plus, controles de ventanas en la puerta', 5, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/05e27af01c8e5915ce69b90c82aea19b568099a2a0e58b300bf32d6af0e8ad1b.png', 'Changan X7 Plus, selector de cambios y consola central', 6, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/6bebaef597508f113dee3c63066414262331058ece93bbb7d15f051713323de9.png', 'Changan X7 Plus, pantalla multimedia y climatización', 7, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/128c85bfd93d932d0e1425ad0d83d2432c7a8cd5cc7e975f50791e74c08632be.png', 'Changan X7 Plus, controles del techo', 8, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/6b424baef9abc32ea02f55301553675286980cf044150efd8ec0e5705c6e1f51.png', 'Changan X7 Plus, asientos delanteros', 9, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/0310fc170fd136a90824ea1dbda38d3eccdfd5c1634b9b21ec16a8919231bdbe.png', 'Changan X7 Plus, asientos posteriores', 10, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/7c8115ff988562b7bc50a083243724274ea2e2b79f21f428002423a31aa3010e.png', 'Changan X7 Plus, maletero y tercera fila', 11, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/1c175c7b7ae5c2cf1242e056e0402359b7636f130810e2b34f6d53f7c8ef7fe2.png', 'Changan X7 Plus, compartimento bajo el piso del maletero', 12, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/42f0258eb44be63768dfe9f8235a5aac6069834ba54a09dfec3efeb8756999cc.png', 'Changan X7 Plus gris sobre fondo de estudio', 13, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/b76342a3fdc40cd4e050526ff74dd7687fe700f728058d84013549e7a25eb4a7.png', 'Changan X7 Plus gris, vista frontal sobre fondo blanco', 14, false, null, null, null, null),
  ('changan-x7-plus', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/931db69eb615237719eaca09dc5599a44392fb404b2c530e0a24b267cfab4d7b.png', 'Changan X7 Plus gris, vista lateral sobre fondo blanco', 15, false, null, null, null, null),
  ('changan-cx70', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/e58a3faa544ab1a2f206f20fa643864df6834791ce036bf7d8afa706614bdc46.jpeg', 'Changan CX70 front', 0, true, 'Rutger van der Maar', 'https://commons.wikimedia.org/wiki/File:Changan_CX70_front.jpg', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0'),
  ('jetur-x70', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/3eb9969ad7b6f77cc31b7fde8ad8066ba317e8ab350b550324e6a9a44d057710.jpeg', '2018 Chery Jetour X70, front 8.7.18', 0, true, 'Kevauto', 'https://commons.wikimedia.org/wiki/File:2018_Chery_Jetour_X70,_front_8.7.18.jpg', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0'),
  ('glory-580', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/f6e6528a9fd14a4fde66aeb3a50e59b0720b03e49652d438026fbc160879da5b.jpeg', '2017 Dongfeng-Fengguang 580, front 8.3.18', 0, true, 'Kevauto', 'https://commons.wikimedia.org/wiki/File:2017_Dongfeng-Fengguang_580,_front_8.3.18.jpg', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0'),
  ('glory-560', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/5f209eca426f950e65b5c40929a1ca60892652726dc6b6d636e82beaa44f7fd3.jpeg', '2019 DFSK Glory 560 L-Type 1.5 (20191020) 01', 0, true, 'オーバードライブ83', 'https://commons.wikimedia.org/wiki/File:2019_DFSK_Glory_560_L-Type_1.5_(20191020)_01.jpg', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0'),
  ('jac-s8', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/f27167d00fb1a74c0b16106f473938b7be836dd8eb3b903e9ee82e513af2fd25.jpeg', '2022 JAC JS8 1.5 TGDi Luxury', 0, true, 'RL GNZLZ', 'https://commons.wikimedia.org/wiki/File:2022_JAC_JS8_1.5_TGDi_Luxury.jpg', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0'),
  ('toyota-yaris', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/24f7a7927c130fc32869506d062ef2a9e563bf367c4b7c05d41ea100c0e05f5d.jpeg', '2009 Toyota Yaris (NCP93R) YRX sedan (2010-11-09) 01', 0, true, 'Brenden Ashton', 'https://commons.wikimedia.org/wiki/File:2009_Toyota_Yaris_(NCP93R)_YRX_sedan_(2010-11-09)_01.jpg', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0'),
  ('hyundai-verna', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/679fb5e3a2cfb14e886d00a81394224b986a9f4e5cffab7a2b884b3bccf8804b.jpeg', '2020 Hyundai Verna Facelift China RC (1)', 0, true, 'Avante2025', 'https://commons.wikimedia.org/wiki/File:2020_Hyundai_Verna_Facelift_China_RC_(1).jpg', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0'),
  ('hyundai-accent', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/d96af29c5d52ef5857dc9555ac8b12675f58672396b706c3676a4b4e898e2624.jpeg', '2020 Hyundai Accent Essential in Urban Grey, Front Right, 05-23-2023', 0, true, 'Elise240SX', 'https://commons.wikimedia.org/wiki/File:2020_Hyundai_Accent_Essential_in_Urban_Grey,_Front_Right,_05-23-2023.jpg', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0'),
  ('changan-alsvin', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/63e5864b5803bd4f7d617b3a4183aea6b42014dd237ce9c4cea848ee74c2410f.png', 'Changan Alsvin plateado, vista frontal de tres cuartos', 0, false, null, null, null, null),
  ('changan-alsvin', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/730f17b5ed51859ffc26e885f692dac23d1ece4c65369e15090a3a21b6eb0db9.png', 'Changan Alsvin plateado, vista frontal', 1, false, null, null, null, null),
  ('changan-alsvin', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/ab319d1ba4d8aa9060f677265e4af172bb1501e17f20292a7f3f146b64080d8b.png', 'Changan Alsvin plateado, vista lateral', 2, false, null, null, null, null),
  ('suzuki-ertiga', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/49492f2f6d425e5229a9e4a2abdb8a614bea3cdb47ccfd9f7a5d570ecc5ad9fb.png', 'Suzuki Ertiga blanca de Renting Car A&M, vista frontal de tres cuartos', 0, false, null, null, null, null),
  ('suzuki-ertiga', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/629fa5b94fdb80a005072f26c63e198df8905e0e4dc3aa55729edc7e37b6b624.png', 'Suzuki Ertiga blanca, vista frontal desde el lado opuesto', 1, false, null, null, null, null),
  ('suzuki-ertiga', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/f2a2b758b3dcecf2feb1b0a751681bbaadd8cd3d2428df1a38f5cd7d09f7fab9.png', 'Suzuki Ertiga blanca, vista posterior de tres cuartos', 2, false, null, null, null, null),
  ('suzuki-ertiga', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/67fe0476177998bb8e71e1d5a76e91fbd1444d8aaee4094de57f35c5522ac71a.png', 'Suzuki Ertiga blanca, vista de tres cuartos sobre fondo de estudio', 3, false, null, null, null, null),
  ('suzuki-ertiga', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/8904785c6576f42e039fb5ff0ffa7e0000a17ba053e7e604f9230d2c798b0956.png', 'Suzuki Ertiga blanca, vista frontal sobre fondo blanco', 4, false, null, null, null, null),
  ('suzuki-ertiga', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/c4e19f4d84f68356573a9e8f62aca2d9cec5c899b189ff3492b8204ee18d9769.png', 'Suzuki Ertiga blanca, vista lateral sobre fondo blanco', 5, false, null, null, null, null);
insert into public.configuracion_web (titulo,destacado,eslogan,portada,boton_1,destino_1,boton_2,destino_2,telefono,whatsapp,maps,waze) values
  ('Alquiler de vehículos,
maquinaria y', 'transporte de carga.', 'Movilidad para su día a día.
Equipo para sus proyectos.', 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/8a37378a9258429c0a30973e07554a1e3bc0b01ff03025fbc5607f74f0ca9eff.webp', 'Ver flota de vehículos', '/flota/', 'Maquinaria y transporte', '/maquinaria-y-transporte/', '01 4800-300', '51993334984', 'https://www.google.com/maps/search/?api=1&query=Av.%20Santiago%20de%20Surco%203573%2C%20Santiago%20de%20Surco%2015038', 'https://waze.com/ul?q=Av.%20Santiago%20de%20Surco%203573%2C%20Lima&navigate=yes');
commit;
