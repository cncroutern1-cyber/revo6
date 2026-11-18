import { useEffect, useState } from "react";
import { sb } from "../supabase.js";
import { FALLBACK_USERS } from "../utils.js";
import PasswordInput from "./PasswordInput.jsx";

// Carved-wood lattice, drawn in SVG so the page needs no image file.
const ORNAMENT = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
<rect width='120' height='120' fill='#e8dac3'/>
<g fill='none' stroke='#a98055' stroke-width='1.5' stroke-linejoin='round'>
<path d='M60 5L115 60 60 115 5 60Z'/>
<path d='M60 22L98 60 60 98 22 60Z' stroke-opacity='.7'/>
<circle cx='60' cy='60' r='24'/>
<path d='M60 36L77 43 84 60 77 77 60 84 43 77 36 60 43 43Z'/>
<circle cx='60' cy='60' r='7' fill='#a98055' fill-opacity='.35'/>
<path d='M0 0L22 22M120 0L98 22M0 120L22 98M120 120L98 98'/>
<circle cx='0' cy='0' r='10'/><circle cx='120' cy='0' r='10'/><circle cx='0' cy='120' r='10'/><circle cx='120' cy='120' r='10'/>
</g></svg>`;

const PATTERN = `url("data:image/svg+xml,${encodeURIComponent(ORNAMENT)}")`;
const SHADE = "linear-gradient(rgba(255,250,240,.35),rgba(255,250,240,.35))";

// To use your own photo of furniture or carved screens: put it in the "public" folder as login-bg.jpg.
const PHOTO = `url(${import.meta.env.BASE_URL}login-bg.jpg)`;

export default function Login() {
  const [users, setUsers] = useState(null);
  const [who, setWho] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // The list of names comes from the database, so users added by the admin show up here.
  useEffect(() => {
    let off = false;
    sb.from("profiles")
      .select("username,email,role")
      .order("username")
      .then(({ data, error }) => {
        if (off) return;
        setUsers(!error && data && data.length ? data : FALLBACK_USERS);
      });
    return () => {
      off = true;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const u = (users || []).find((x) => x.username === who);
    if (!u) return setErr("Ismingizni tanlang.");
    if (!pass) return setErr("Parolni kiriting.");
    setBusy(true);
    const { error } = await sb.auth.signInWithPassword({ email: u.email, password: pass });
    setBusy(false);
    if (error) {
      setErr(
        /invalid login/i.test(error.message)
          ? "Parol noto'g'ri, yoki bu foydalanuvchi Supabase'da yaratilmagan."
          : "Xato: " + error.message
      );
    }
    else setPass("");
  }

  return (
    <div
      className="login"
      style={{
        backgroundImage: `${SHADE}, ${PHOTO}, ${PATTERN}`,
        backgroundSize: "auto, cover, 120px 120px",
      }}
    >
      <form className="login-card" onSubmit={submit}>
        <h1>Ish kuzatuv</h1>
        <p className="lead">Mebel va naqsh ishlari hisobi. Davom etish uchun kiring.</p>
        <div className="f">
          <label htmlFor="who">Foydalanuvchi</label>
          <select id="who" value={who} onChange={(e) => setWho(e.target.value)} disabled={!users}>
            <option value="">{users ? "Tanlang..." : "Yuklanmoqda..."}</option>
            {(users || []).map((u) => (
              <option key={u.username} value={u.username}>
                {u.username}
              </option>
            ))}
          </select>
        </div>
        <div className="f">
          <label htmlFor="lPass">Parol</label>
          <PasswordInput id="lPass" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        <div className="errtxt">{err}</div>
        <div className="mbtns">
          <button className="btn primary" style={{ flex: 1, padding: "10px 14px" }} disabled={busy}>
            Kirish
          </button>
        </div>
      </form>
    </div>
  );
}
