-- Supabase -> SQL Editor -> New query ga butun shu matnni qo'yib, "Run" bosing.

create table if not exists public.jobs (
  id text primary key,
  title text not null,
  customer text default '',
  parts int default 1,
  size text default 'katta',
  stage int default 0,
  material text default '',
  thick text default '',
  dims text default '',
  price numeric default 0,
  advance numeric default 0,
  due text default '',
  note text default '',
  created text default '',
  done text default '',
  img text,
  pos bigint default 0
);

create table if not exists public.customers (
  name text primary key,
  phone text default ''
);

alter table public.jobs enable row level security;
alter table public.customers enable row level security;

drop policy if exists "jobs_auth_all" on public.jobs;
drop policy if exists "customers_auth_all" on public.customers;

create policy "jobs_auth_all" on public.jobs
  for all to authenticated using (true) with check (true);
create policy "customers_auth_all" on public.customers
  for all to authenticated using (true) with check (true);

-- Boshqa qurilmalarda o'zgarish darrov ko'rinishi uchun (realtime)
do $$
begin
  begin alter publication supabase_realtime add table public.jobs; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.customers; exception when duplicate_object then null; end;
end $$;
