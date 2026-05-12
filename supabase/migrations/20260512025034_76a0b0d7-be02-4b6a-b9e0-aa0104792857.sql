create or replace function public.ensure_user_workspace(_email text default null, _full_name text default null)
returns table (
  profile_id uuid,
  org_id uuid,
  full_name text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_profile public.profiles%rowtype;
  workspace_id uuid;
  display_name text;
  base_slug text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  display_name := nullif(trim(coalesce(_full_name, split_part(coalesce(_email, ''), '@', 1), 'User')), '');
  if display_name is null then
    display_name := 'User';
  end if;

  select * into existing_profile
  from public.profiles
  where id = current_user_id
  limit 1;

  if existing_profile.id is not null and existing_profile.org_id is not null then
    return query
      select existing_profile.id, existing_profile.org_id, existing_profile.full_name, existing_profile.role;
    return;
  end if;

  base_slug := lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'workspace';
  end if;

  insert into public.organizations (name, slug)
  values (
    display_name || '''s workspace',
    left(base_slug, 40) || '-' || substr(current_user_id::text, 1, 8)
  )
  returning id into workspace_id;

  if existing_profile.id is null then
    insert into public.profiles (id, org_id, full_name, role)
    values (current_user_id, workspace_id, display_name, 'owner');
  else
    update public.profiles
    set org_id = workspace_id,
        full_name = coalesce(existing_profile.full_name, display_name),
        role = coalesce(existing_profile.role, 'owner')
    where id = current_user_id;
  end if;

  return query
    select p.id, p.org_id, p.full_name, p.role
    from public.profiles p
    where p.id = current_user_id;
end;
$$;

revoke all on function public.ensure_user_workspace(text, text) from public;
grant execute on function public.ensure_user_workspace(text, text) to authenticated;