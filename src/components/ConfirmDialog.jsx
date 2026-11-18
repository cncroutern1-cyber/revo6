import { useEffect } from "react";

// tone "danger" (red button) is for deleting; "primary" is for ordinary confirmations such as signing out.
export default function ConfirmDialog({ title, text, yes = "O'chirish", tone = "danger", onYes, onNo }) {
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
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="mbtns">
          <span className="sp" />
          <button className="btn" onClick={onNo} autoFocus>
            Bekor qilish
          </button>
          <button className={tone === "primary" ? "btn primary" : "btn danger solid"} onClick={onYes}>
            {yes}
          </button>
        </div>
      </div>
    </div>
  );
}
