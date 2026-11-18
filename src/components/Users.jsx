import { useCallback, useEffect, useState } from "react";
import Page from "./Page.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import PasswordInput from "./PasswordInput.jsx";
import { sb } from "../supabase.js";
import { useT } from "../i18n.jsx";

// All user changes go through a server function (manage-users) that checks the caller is an admin.
async function callAdmin(body) {
  const { data, error } = await sb.functions.invoke("manage-users", { body });
  if (error) {
    let msg = error.message || "Xato";
    try {
      const j = await error.context.json();
      msg = j.error || j.message || msg;
    } catch {
      /* keep msg */
    }
    if (/not found|NOT_FOUND|Failed to send/i.test(msg)) {
      msg = "Server funksiyasi topilmadi. Supabase'da manage-users funksiyasini yarating (README).";
    }
    return { error: msg };
  }
  if (data && data.error) return { error: data.error };
  return { data };
}

export default function Users({ me }) {
  const t = useT();
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState(null); // { text, pw }
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "worker" });
  const [edit, setEdit] = useState(null); // { username, pw }
  const [ask, setAsk] = useState(null); // username to delete

  const load = useCallback(async () => {
    const { data, error } = await callAdmin({ action: "list" });
    if (error) setErr(error);
    else {
      setErr("");
      setUsers(data.users);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(body, okText, pw) {
    setBusy(true);
    setErr("");
    const { error } = await callAdmin(body);
    setBusy(false);
    if (error) {
      setErr(error);
      return false;
    }
    setNotice({ text: okText, pw: pw || "" });
    await load();
    return true;
  }

  async function add(e) {
    e.preventDefault();
    const username = form.username.trim();
    if (!username || !form.password) return setErr(t("Ism va parolni kiriting."));
    const ok = await run(
      { action: "create", username, password: form.password, role: form.role },
      t("\"{0}\" qo'shildi. Parol:", username),
      form.password
    );
    if (ok) setForm({ username: "", password: "", role: "worker" });
  }

  async function changePw() {
    if (!edit.pw) return setErr(t("Yangi parolni kiriting."));
    const ok = await run(
      { action: "password", username: edit.username, password: edit.pw },
      t("\"{0}\" paroli o'zgartirildi. Yangi parol:", edit.username),
      edit.pw
    );
    if (ok) setEdit(null);
  }

  async function remove() {
    const username = ask;
    setAsk(null);
    await run({ action: "delete", username }, t("\"{0}\" o'chirildi.", username));
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* user can still select the text */
    }
  }

  return (
    <Page title={t("Foydalanuvchilar")}>
      {err && <div className="errtxt" style={{ marginBottom: 10 }}>{t(err)}</div>}
      {notice && (
        <div className="notice">
          <div>
            {notice.text} {notice.pw && <code className="pw">{notice.pw}</code>}
          </div>
          {notice.pw && (
            <>
              <div className="hint">{t("Parolni hozir nusxalab oling. Keyin uni ko'rib bo'lmaydi.")}</div>
              <button className="btn small" onClick={() => copy(notice.pw)}>
                {t("Nusxalash")}
              </button>
            </>
          )}
        </div>
      )}

      {users === null && !err && <div className="empty">{t("Yuklanmoqda...")}</div>}
      {users &&
        users.map((u) => (
          <div className="urow" key={u.username}>
            <div className="uline">
              <div className="uname">
                <b>{u.username}</b>
                <span className={"chip " + (u.role === "admin" ? "yel" : "")}>{u.role === "admin" ? t("Admin") : t("Ishchi")}</span>
                {u.username === me && <span className="chip">{t("Siz")}</span>}
              </div>
              <div className="uact">
                <button className="btn small" onClick={() => setEdit({ username: u.username, pw: "" })}>
                  {t("Parolni o'zgartirish")}
                </button>
                <button className="btn small danger" disabled={u.username === me} onClick={() => setAsk(u.username)}>
                  {t("O'chirish")}
                </button>
              </div>
            </div>
            {edit && edit.username === u.username && (
              <div className="pwedit">
                <PasswordInput
                  placeholder={t("Yangi parol (kamida 6 belgi)")}
                  ariaLabel={t("Yangi parol")}
                  value={edit.pw}
                  onChange={(e) => setEdit({ ...edit, pw: e.target.value })}
                  autoComplete="new-password"
                  autoFocus
                />
                <button className="btn small primary" disabled={busy} onClick={changePw}>
                  {t("Saqlash")}
                </button>
                <button className="btn small" onClick={() => setEdit(null)}>
                  {t("Bekor qilish")}
                </button>
              </div>
            )}
          </div>
        ))}

      <form className="uadd" onSubmit={add}>
        <div className="sub" style={{ marginTop: 0 }}>{t("Yangi foydalanuvchi qo'shish")}</div>
        <div className="two">
          <div className="f">
            <label htmlFor="nuName">{t("Ism (login uchun)")}</label>
            <input id="nuName" type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t("Masalan: Jasur")} />
          </div>
          <div className="f">
            <label htmlFor="nuRole">{t("Vazifasi")}</label>
            <select id="nuRole" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="worker">{t("Ishchi")}</option>
              <option value="admin">{t("Admin")}</option>
            </select>
          </div>
        </div>
        <div className="f">
          <label htmlFor="nuPass">{t("Parol (kamida 6 belgi)")}</label>
          <PasswordInput id="nuPass" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="mbtns">
          <button className="btn primary" disabled={busy}>
            {t("Qo'shish")}
          </button>
        </div>
      </form>

      {ask && (
        <ConfirmDialog
          title={t("Foydalanuvchini o'chirish")}
          text={t("\"{0}\" tizimdan o'chiriladi va endi kira olmaydi. Uning kiritgan ishlari saqlanib qoladi.", ask)}
          onYes={remove}
          onNo={() => setAsk(null)}
        />
      )}
    </Page>
  );
}
