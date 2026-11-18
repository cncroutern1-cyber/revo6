-- Run once if your database was created before the "detallar kvadrati" field existed.
alter table public.jobs add column if not exists area numeric default 0;
alter table public.jobs add column if not exists rate numeric default 0;
alter table public.jobs add column if not exists mat_ours boolean default false;
alter table public.jobs add column if not exists mat_price numeric default 0;

-- Rang va biriktirilgan fayl
alter table public.jobs add column if not exists color text default '';
alter table public.jobs add column if not exists file_name text default '';
alter table public.jobs add column if not exists file_path text default '';

-- Fayllar uchun xotira (Storage)
insert into storage.buckets (id, name, public) values ('job-files', 'job-files', true) on conflict (id) do nothing;
drop policy if exists "job-files upload" on storage.objects;
create policy "job-files upload" on storage.objects for insert to authenticated with check (bucket_id = 'job-files');
drop policy if exists "job-files read" on storage.objects;
create policy "job-files read" on storage.objects for select to authenticated using (bucket_id = 'job-files');

-- Material narxlari ro'yxati (so'm / m²), admin o'zgartiradi
create table if not exists public.materials (name text primary key, price numeric default 0);
alter table public.materials enable row level security;
drop policy if exists "materials_auth_all" on public.materials;
create policy "materials_auth_all" on public.materials for all to authenticated using (true) with check (true);
