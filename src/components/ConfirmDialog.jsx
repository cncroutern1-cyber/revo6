import { useEffect } from "react";
import { useT } from "../i18n.jsx";

// tone "danger" (red button) is for deleting; "primary" is for ordinary confirmations such as signing out.
export default function ConfirmDialog({ title, text, yes, tone = "danger", onYes, onNo }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onNo();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onNo]);

  return (
    <div className="overlay on" style={{ zIndex: 20 }}>
      <div className="modal small" role="alertdialog" aria-modal="true" aria-label={title}>
        <button type="button" className="xbtn" onClick={onNo} aria-label={t("Yopish")} title={t("Yopish")}>
          ×
        </button>
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="mbtns">
          <span className="sp" />
          <button className="btn" onClick={onNo} autoFocus>
            {t("Bekor qilish")}
          </button>
          <button className={tone === "primary" ? "btn primary" : "btn danger solid"} onClick={onYes}>
            {yes || t("O'chirish")}
          </button>
        </div>
      </div>
    </div>
  );
}
