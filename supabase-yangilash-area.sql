-- Run once if your database was created before the "detallar kvadrati" field existed.
alter table public.jobs add column if not exists area numeric default 0;
alter table public.jobs add column if not exists rate numeric default 0;
alter table public.jobs add column if not exists mat_ours boolean default false;
alter table public.jobs add column if not exists mat_price numeric default 0;
