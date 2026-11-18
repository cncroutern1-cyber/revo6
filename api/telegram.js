// Vercel serverless function: sends the website contact form to Telegram.
// Needs two environment variables in Vercel (Settings -> Environment Variables):
//   TELEGRAM_BOT_TOKEN  - token from @BotFather
//   TELEGRAM_CHAT_ID    - chat id of the person/group that should receive the messages
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(503).json({ ok: false, error: "not-configured" });

  let b = req.body;
  if (typeof b === "string") {
    try {
      b = JSON.parse(b);
    } catch (e) {
      b = {};
    }
  }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill this field
  const clean = (v, n) => String(v || "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, n);
  const name = clean(b.name, 80);
  const phone = clean(b.phone, 40);
  const topic = clean(b.topic, 80);
  const message = clean(b.message, 1500);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 9 || message.length < 5) {
    return res.status(400).json({ ok: false, error: "invalid" });
  }
  const text = `📩 Saytdan yangi xabar\n\nMavzu: ${topic || "—"}\nIsm: ${name}\nTelefon: ${phone}\n\n${message}`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: "telegram" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "network" });
  }
}
