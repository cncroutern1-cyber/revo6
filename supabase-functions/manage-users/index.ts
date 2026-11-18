// Supabase Edge Function: manage-users
// Lets an admin list, add and delete users and set their passwords.
// Runs on the server, so the secret key never reaches the browser.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    // 1. Who is calling?
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: who } = await admin.auth.getUser(token);
    const callerEmail = who?.user?.email;
    if (!callerEmail) return json({ error: "Avval tizimga kiring." }, 401);

    // 2. Only admins may continue.
    const { data: me } = await admin.from("profiles").select("username, role").eq("email", callerEmail).maybeSingle();
    if (!me || me.role !== "admin") return json({ error: "Bu amal faqat admin uchun." }, 403);

    const body = await req.json();
    const action = body.action;

    const findAuthUser = async (email: string) => {
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw error;
        const hit = data.users.find((u) => u.email === email);
        if (hit) return hit;
        if (data.users.length < 200) break;
      }
      return null;
    };
    const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

    if (action === "list") {
      const { data, error } = await admin.from("profiles").select("username, email, role").order("username");
      if (error) throw error;
      return json({ users: data });
    }

    if (action === "create") {
      const username = String(body.username ?? "").trim();
      const password = String(body.password ?? "");
      const role = body.role === "admin" ? "admin" : "worker";
      if (username.length < 2 || username.length > 30) return json({ error: "Ism 2 dan 30 gacha belgi bo'lsin." }, 400);
      const s = slug(username);
      if (!s) return json({ error: "Ismda lotin harflari yoki raqamlar bo'lishi kerak." }, 400);
      if (password.length < 6) return json({ error: "Parol kamida 6 belgi bo'lsin." }, 400);
      const email = `${s}@ishkuzatuv.com`;

      const { data: dupName } = await admin.from("profiles").select("username").eq("username", username).maybeSingle();
      const { data: dupMail } = await admin.from("profiles").select("username").eq("email", email).maybeSingle();
      if (dupName || dupMail) return json({ error: "Bunday foydalanuvchi allaqachon bor." }, 400);

      const { error: e1 } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (e1) return json({ error: e1.message }, 400);
      const { error: e2 } = await admin.from("profiles").insert({ username, email, role });
      if (e2) {
        const u = await findAuthUser(email);
        if (u) await admin.auth.admin.deleteUser(u.id);
        return json({ error: e2.message }, 400);
      }
      return json({ ok: true });
    }

    if (action === "password") {
      const username = String(body.username ?? "");
      const password = String(body.password ?? "");
      if (password.length < 6) return json({ error: "Parol kamida 6 belgi bo'lsin." }, 400);
      const { data: p } = await admin.from("profiles").select("email").eq("username", username).maybeSingle();
      if (!p) return json({ error: "Foydalanuvchi topilmadi." }, 404);
      const u = await findAuthUser(p.email);
      if (!u) return json({ error: "Foydalanuvchi topilmadi." }, 404);
      const { error } = await admin.auth.admin.updateUserById(u.id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const username = String(body.username ?? "");
      if (username === me.username) return json({ error: "O'zingizni o'chira olmaysiz." }, 400);
      const { data: p } = await admin.from("profiles").select("email, role").eq("username", username).maybeSingle();
      if (!p) return json({ error: "Foydalanuvchi topilmadi." }, 404);
      if (p.role === "admin") {
        const { count } = await admin.from("profiles").select("username", { count: "exact", head: true }).eq("role", "admin");
        if ((count ?? 0) <= 1) return json({ error: "Oxirgi adminni o'chirib bo'lmaydi." }, 400);
      }
      const u = await findAuthUser(p.email);
      if (u) {
        const { error } = await admin.auth.admin.deleteUser(u.id);
        if (error) return json({ error: error.message }, 400);
      }
      await admin.from("profiles").delete().eq("username", username);
      return json({ ok: true });
    }

    return json({ error: "Noma'lum amal." }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
