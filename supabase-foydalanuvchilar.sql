-- Supabase -> SQL Editor -> New query: paste all of this and press Run.
-- Creates the list of users (names and roles). Passwords are never stored here; Supabase keeps them hashed.

create table if not exists public.profiles (
  username text primary key,
  email text unique not null,
  role text not null default 'worker' check (role in ('admin','worker'))
);

alter table public.profiles enable row level security;

-- Anyone may read names and roles (the login page needs the list of names).
-- Nobody can change this table from the browser; only the manage-users server function can.
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select to anon, authenticated using (true);

-- Your two existing users:
insert into public.profiles (username, email, role) values
  ('Abdulloh', 'abdulloh@ishkuzatuv.com', 'admin'),
  ('Mirzabek', 'mirzabek@ishkuzatuv.com', 'worker')
on conflict (username) do nothing;
