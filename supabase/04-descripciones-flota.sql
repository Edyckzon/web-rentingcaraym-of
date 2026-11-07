-- Etapa 1: propuesta de contenido; aplicar después de revisar el catálogo vivo.
-- Actualiza únicamente descripciones de vehículos existentes. No crea vehículos,
-- ni modifica IDs, fotos, categorías, permisos o configuración de autenticación.
-- Reejecutable. Si Marketing cambió un texto desde la revisión, aborta para no pisarlo.
begin;

create temporary table descripciones_propuestas (
  id text primary key,
  nombre text not null,
  descripcion text not null
) on commit drop;

insert into descripciones_propuestas (id, nombre, descripcion) values
('changan-alsvin', 'Changan Alsvin',
 'Alquiler de Changan Alsvin en Lima para sus desplazamientos personales o de trabajo. Nuestra unidad 2022 cuenta con transmisión mecánica y combustible dual gasolina/GLP. Consulte disponibilidad para sus fechas y coordine el recojo con nuestro equipo en Santiago de Surco.'),
('changan-cx70', 'Changan CX70',
 'Alquiler de Changan CX70 en Lima para quienes buscan una camioneta SUV para su movilidad familiar o laboral. Contamos con una unidad 2023 de transmisión mecánica y combustible dual gasolina/GLP. Indíquenos las fechas y el número de pasajeros para confirmar la configuración y preparar su cotización desde Surco.'),
('changan-x7-plus', 'Changan X7 Plus',
 'Alquiler de Changan X7 Plus en Lima para su movilidad personal, familiar o empresarial. Nuestra unidad 2026 tiene transmisión automática y combustible dual gasolina/GLP. Cuéntenos cuántas personas viajarán y las fechas de uso para confirmar disponibilidad y coordinar su alquiler desde Santiago de Surco.'),
('ford-territory', 'Ford Territory',
 'Alquiler de Ford Territory en Lima para sus traslados personales, familiares o ejecutivos. Disponemos de una SUV 2026 con transmisión automática y motor a gasolina. Solicite una propuesta indicando sus fechas y necesidades de movilidad; nuestro equipo en Surco le confirmará disponibilidad, requisitos y condiciones.'),
('glory-560', 'Glory 560',
 'Alquiler de Glory 560 en Lima para organizar su movilidad personal o de trabajo con una camioneta SUV. Nuestra unidad 2023 cuenta con transmisión mecánica y combustible dual gasolina/GLP. Consulte con nuestro equipo en Santiago de Surco la disponibilidad, capacidad de la unidad y condiciones para las fechas que necesita.'),
('glory-580', 'Glory 580',
 'Alquiler de Glory 580 en Lima para sus planes familiares o necesidades de movilidad empresarial. Contamos con una SUV 2023 de transmisión mecánica y combustible dual gasolina/GLP. Comparta las fechas, el número de pasajeros y el uso previsto para recibir una cotización personalizada desde nuestra sede en Surco.'),
('hyundai-accent', 'Hyundai Accent',
 'Alquiler de Hyundai Accent en Lima para desplazamientos personales, gestiones o compromisos de trabajo. Consulte la versión, transmisión y características de la unidad disponible antes de reservar. Nuestro equipo en Santiago de Surco le ayudará a coordinar las fechas, los requisitos y el lugar de recojo.'),
('hyundai-verna', 'Hyundai Verna',
 'Alquiler de Hyundai Verna en Lima para su movilidad diaria o laboral. Consulte nuestras opciones 2022 con transmisión automática o mecánica y combustible dual gasolina/GLP, sujetas a disponibilidad. Indique qué caja prefiere y sus fechas para que nuestro equipo en Surco prepare una propuesta acorde a su solicitud.'),
('jac-s8', 'JAC JS8',
 'Alquiler de JAC JS8 en Lima para sus traslados familiares o de empresa. Nuestra SUV 2023 cuenta con transmisión automática y combustible dual gasolina/GLP. Indique las fechas de uso, los pasajeros y el equipaje previsto para confirmar la capacidad de la unidad y coordinar su cotización desde Santiago de Surco.'),
('jetur-x70', 'Jetour X70',
 'Alquiler de Jetour X70 en Lima para quienes buscan una camioneta SUV para su familia o equipo de trabajo. Consulte la versión, transmisión y capacidad de la unidad disponible. Comparta sus fechas y necesidades con Renting Car A&M para coordinar el recojo y las condiciones del alquiler desde Surco.'),
('suzuki-ertiga', 'Suzuki Ertiga',
 'Alquiler de Suzuki Ertiga en Lima para su movilidad familiar o grupal. Nuestra unidad 2020 cuenta con transmisión automática y motor a gasolina. Indíquenos cuántas personas viajarán y cuánto equipaje llevarán para confirmar la distribución disponible y preparar su cotización con atención desde Santiago de Surco.'),
('toyota-yaris', 'Toyota Yaris',
 'Alquiler de Toyota Yaris en Lima para sus desplazamientos personales, trámites o actividades de trabajo. Nuestra unidad 2010 tiene transmisión mecánica y combustible dual gasolina/GLP. Consulte disponibilidad y requisitos para sus fechas; coordinamos su cotización y recojo desde Santiago de Surco.');

-- Bloquear solo las filas revisadas durante la comprobación y actualización.
do $$
begin
  perform v.id from public.vehiculos v
    join descripciones_propuestas p on p.id = v.id for update of v;
  if exists (
    select 1 from descripciones_propuestas p
    left join public.vehiculos v on v.id = p.id
    where v.id is null or v.nombre <> p.nombre
      or v.descripcion not in (
        p.descripcion,
        'Solicite una cotización para el alquiler de ' || p.nombre || '. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.'
      )
  ) then
    raise exception 'El catálogo cambió desde la revisión: comparar nombres y descripciones antes de aplicar.';
  end if;
end $$;

update public.vehiculos v
set descripcion = p.descripcion
from descripciones_propuestas p
where v.id = p.id and v.descripcion is distinct from p.descripcion
returning v.id, v.nombre, v.descripcion;

commit;
