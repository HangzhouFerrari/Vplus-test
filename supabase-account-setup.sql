-- Eenmalig uitvoeren in Supabase > SQL Editor.
-- Hiermee kan alleen een ingelogde gebruiker zijn eigen account verwijderen.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Je bent niet ingelogd';
  end if;

  delete from public.synced_sets where user_id = current_user_id;
  delete from public.sets where owner_id = current_user_id;
  delete from public.profiles where id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
