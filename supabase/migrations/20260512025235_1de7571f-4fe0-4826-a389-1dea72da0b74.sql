drop policy if exists "waitlist_insert_any" on public.waitlist;
create policy "waitlist_insert_valid_email" on public.waitlist
for insert
to anon, authenticated
with check (
  email is not null
  and length(email) <= 320
  and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);