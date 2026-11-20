# Revo — sayt
Statik sayt (`index.html`) + Telegram uchun `api/telegram.js`.
Vercel'da Environment Variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. Build sozlamasi kerak emas.

## Admin (mahsulotlarni boshqarish)
1. Supabase: Authentication → Users → Add user `admin@revo-sayt.uz` (parol o'zingizniki, Auto Confirm yoqilgan).
2. SQL Editor'da `supabase-sayt-admin.sql` ni ishga tushiring.
3. Saytda Ctrl+7 (telefonda logotipni 5 marta bosing) → parolni kiriting → pastda admin paneli chiqadi.
4. Birinchi marta "Mahsulotlarni bazaga ko'chirish" tugmasini bosing. Keyin har bir mahsulotda ✎ va 🗑, pastda "＋ Mahsulot" bor.

## Google bilan kirish (admin)
1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application).
   Authorized redirect URI: `https://gdztsvxcxfoqptogvwhf.supabase.co/auth/v1/callback`
2. Supabase → Authentication → Providers → Google: yoqing, Client ID va Client Secret ni kiriting.
3. Supabase → Authentication → URL Configuration: Site URL va Redirect URLs ga sayt manzilini qo'shing (masalan `https://shirma.uz`).
4. SQL Editor: `insert into public.site_admins (email) values ('sizning@gmail.com');`
5. Saytda Ctrl+7 → "Google bilan kirish". Faqat `site_admins` ro'yxatidagi emaillar admin bo'ladi.
