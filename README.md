# Ish kuzatuv (React)

Work-tracking board for a CNC router shop. React + Vite, data in Supabase, hosted on GitHub Pages.

## 1. Supabase (once)
1. SQL Editor: run the whole of `supabase-sozlash.sql` (tables, access rules, live updates).
2. Authentication > Users > Add user (turn on "Auto Confirm User"):
   - `abdulloh@ishkuzatuv.com` (admin)
   - `mirzabek@ishkuzatuv.com` (worker)
   Set each person's password here.
3. Turn off "Allow new users to sign up".
4. User management (admin only): run the whole of `supabase-foydalanuvchilar.sql` in the SQL Editor, then
   Edge Functions > Deploy a new function > Via Editor. Name it `manage-users`, paste the contents of
   `supabase-functions/manage-users/index.ts`, and press Deploy. Keep "Verify JWT" on.
   After that the admin can add users, set passwords and delete users from the "Foydalanuvchilar" button.

## 2. Publish on GitHub Pages
1. Create a repository and upload everything in this folder (keep `.github/workflows/deploy.yml`).
2. Settings > Pages > Source: **GitHub Actions**.
3. Push to `main`. The site builds and appears at `https://YOURNAME.github.io/REPO/`.

## Run on your computer
```
npm install
npm run dev
```
