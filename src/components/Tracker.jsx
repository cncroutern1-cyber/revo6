import { useEffect, useState } from "react";
import { sb } from "../supabase.js";
import { useData } from "../useData.js";
import { usePresence } from "../usePresence.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import Jobs from "./Jobs.jsx";
import Archive from "./Archive.jsx";
import Customers from "./Customers.jsx";
import Report from "./Report.jsx";
import Users from "./Users.jsx";
import { useT } from "../i18n.jsx";
import Icon from "./Icons.jsx";
import LangSwitch from "./LangSwitch.jsx";

const PAGES = [
  { id: "ishlar", label: "Ishlar" },
  { id: "tugatilgan", label: "Tugatilgan ishlar" },
  { id: "mijozlar", label: "Mijozlar" },
  { id: "hisobot", label: "Hisobot", admin: true },
  { id: "foydalanuvchilar", label: "Foydalanuvchilar", admin: true },
];

const fromHash = () => window.location.hash.replace("#", "");

export default function Tracker({ isAdmin, username }) {
  const t = useT();
  const data = useData();
  const online = usePresence(username);
  const [hash, setHash] = useState(fromHash());
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const on = () => setHash(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const pages = PAGES.filter((p) => !p.admin || isAdmin);
  const page = (pages.find((p) => p.id === hash) || pages[0]).id;

  function logout() {
    setConfirm({
      title: t("Chiqish"),
      text: t("Tizimdan chiqmoqchimisiz?"),
      yes: t("Chiqish"),
      tone: "primary",
      onYes: () => {
        setConfirm(null);
        window.location.hash = "";
        sb.auth.signOut();
      },
    });
  }

  const { status, jobs, customers } = data;
  const statusText = status.text.startsWith("Xato: ") ? t("Xato") + status.text.slice(4) : t(status.text);

  return (
    <>
      <header>
        <div className="brand">
          <div className="brand-top">
            <span>{t("Ish kuzatuv")}</span>
            <button className="logout" onClick={logout} title={t("Chiqish")}>
              <Icon name="logout" size={13} />
              {t("Chiqish")}
            </button>
          </div>
          <small>
            {username} · <span className={"status" + (status.err ? " err" : "")}>{statusText}</span>
          </small>
        </div>
        <nav className="tabs" aria-label={t("Sahifalar")}>
          {pages.map((p) => (
            <button
              key={p.id}
              className={"tab" + (page === p.id ? " on" : "")}
              aria-current={page === p.id ? "page" : undefined}
              onClick={() => (window.location.hash = p.id)}
            >
              {t(p.label)}
            </button>
          ))}
        </nav>
        <div className="hright">
          <div className="online" title={t("Hozir tizimda")}>
            <i className="dot d2" />
            {t("Onlayn: {0}", online.length ? online.join(", ") : username)}
          </div>
          <LangSwitch />
        </div>
      </header>

      {page === "ishlar" && <Jobs data={data} isAdmin={isAdmin} />}
      {page === "tugatilgan" && <Archive data={data} isAdmin={isAdmin} />}
      {page === "mijozlar" && <Customers jobs={jobs} customers={customers} isAdmin={isAdmin} onPhone={data.savePhone} />}
      {page === "hisobot" && isAdmin && (
        <Report jobs={jobs} customers={customers} onRestore={data.restore} onWipe={data.wipe} />
      )}
      {page === "foydalanuvchilar" && isAdmin && <Users me={username} />}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          text={confirm.text}
          yes={confirm.yes}
          tone={confirm.tone}
          onYes={confirm.onYes}
          onNo={() => setConfirm(null)}
        />
      )}
    </>
  );
}
