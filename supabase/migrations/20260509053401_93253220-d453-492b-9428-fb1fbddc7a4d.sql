
-- current_org_id is safe as SECURITY INVOKER because profile_read_own
-- only lets a user read their own profile row.
create or replace function public.current_org_id()
returns uuid
language sql stable security invoker set search_path = public
as $$ select org_id from public.profiles where id = auth.uid() limit 1 $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_org_id uuid;
declare display_name text;
begin
  display_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  insert into public.organizations (name, slug)
  values (display_name || '''s workspace', substr(new.id::text, 1, 8))
  returning id into new_org_id;

  insert into public.profiles (id, org_id, full_name, role)
  values (new.id, new_org_id, display_name, 'owner');

  return new;
end $$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Remove broad org self-insert; trigger handles creation
drop policy if exists "org_insert_self" on public.organizations;
