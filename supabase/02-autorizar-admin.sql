-- Ejecutar después de crear y verificar la cuenta en Authentication > Users.
-- Concede permisos en la web; NO concede acceso al dashboard de Supabase.
do $$
declare cuenta uuid;
begin
  select id into strict cuenta from auth.users
    where lower(email)='support@contawebaym.com' and email_confirmed_at is not null
      and deleted_at is null and coalesce(is_anonymous,false)=false;
  insert into renting_privado.administradores(usuario) values(cuenta) on conflict do nothing;
exception when no_data_found then
  raise exception 'Primero crea y confirma support@contawebaym.com en Authentication > Users.';
end $$;
select u.email, 'Administrador de marketing' as permiso
from renting_privado.administradores a join auth.users u on u.id=a.usuario
where lower(u.email)='support@contawebaym.com';
