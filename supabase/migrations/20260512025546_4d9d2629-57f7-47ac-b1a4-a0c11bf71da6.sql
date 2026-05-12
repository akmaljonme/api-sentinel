create policy "org_insert_when_missing_workspace"
on public.organizations
for insert
to authenticated
with check (
  auth.uid() is not null
  and not exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.org_id is not null
  )
);