-- Conserva archivos, orden, créditos y licencias. Solo mejora el texto alternativo.
begin;
update public.vehiculo_fotos f
set alt=v.categoria || ' ' || v.nombre || ' en alquiler en Lima — imagen referencial'
from public.vehiculos v
where f.vehiculo_id=v.id and f.referencial
  and f.alt is distinct from v.categoria || ' ' || v.nombre || ' en alquiler en Lima — imagen referencial';
commit;
