-- Run once if your database was created before the "detallar kvadrati" field existed.
alter table public.jobs add column if not exists area numeric default 0;
