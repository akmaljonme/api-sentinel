
-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text default 'free' check (plan in ('free','pro','team')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id),
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz default now()
);

-- Specs
create table public.specs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  version text,
  content text not null,
  parsed_data jsonb,
  endpoint_count int default 0,
  github_repo text,
  github_path text,
  status text default 'active' check (status in ('active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mock servers
create table public.mock_servers (
  id uuid primary key default gen_random_uuid(),
  spec_id uuid references public.specs(id) on delete cascade,
  org_id uuid references public.organizations(id),
  status text default 'running' check (status in ('running','stopped')),
  request_count int default 0,
  created_at timestamptz default now()
);

-- Mock request logs
create table public.mock_requests (
  id uuid primary key default gen_random_uuid(),
  mock_server_id uuid references public.mock_servers(id) on delete cascade,
  method text,
  path text,
  status_code int,
  duration_ms int,
  response_body jsonb,
  created_at timestamptz default now()
);

-- Drift reports
create table public.drift_reports (
  id uuid primary key default gen_random_uuid(),
  spec_id uuid references public.specs(id) on delete cascade,
  old_version text,
  new_version text,
  old_content text,
  new_content text,
  breaking_count int default 0,
  warning_count int default 0,
  info_count int default 0,
  changes jsonb default '[]',
  created_at timestamptz default now()
);

-- Invitations
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id),
  email text not null,
  role text default 'member',
  token text unique default gen_random_uuid()::text,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- API keys
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id),
  name text not null,
  key_hash text unique not null,
  key_preview text not null,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Waitlist (public)
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.specs enable row level security;
alter table public.mock_servers enable row level security;
alter table public.mock_requests enable row level security;
alter table public.drift_reports enable row level security;
alter table public.api_keys enable row level security;
alter table public.invitations enable row level security;
alter table public.waitlist enable row level security;

-- Helper to get current user's org
create or replace function public.current_org_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select org_id from public.profiles where id = auth.uid() limit 1 $$;

create policy "org_read" on public.organizations for select
  using (id = public.current_org_id());
create policy "org_update" on public.organizations for update
  using (id = public.current_org_id() and exists (
    select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')
  ));

create policy "profile_read_own" on public.profiles for select using (id = auth.uid());
create policy "profile_read_team" on public.profiles for select using (org_id = public.current_org_id());
create policy "profile_update_own" on public.profiles for update using (id = auth.uid());
create policy "profile_insert_own" on public.profiles for insert with check (id = auth.uid());

create policy "specs_all" on public.specs for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

create policy "mocks_all" on public.mock_servers for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

create policy "mock_requests_read" on public.mock_requests for select using (
  mock_server_id in (select id from public.mock_servers where org_id = public.current_org_id())
);

create policy "drift_all" on public.drift_reports for all using (
  spec_id in (select id from public.specs where org_id = public.current_org_id())
) with check (
  spec_id in (select id from public.specs where org_id = public.current_org_id())
);

create policy "apikeys_all" on public.api_keys for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

create policy "invitations_all" on public.invitations for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- Waitlist: anyone (incl. anon) can insert; nobody can read via API
create policy "waitlist_insert_any" on public.waitlist for insert to anon, authenticated with check (true);

-- Org creation: any signed-in user can create their own org
create policy "org_insert_self" on public.organizations for insert
  to authenticated with check (true);

-- Auto-create org + profile on signup
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Realtime for mock_requests
alter publication supabase_realtime add table public.mock_requests;
