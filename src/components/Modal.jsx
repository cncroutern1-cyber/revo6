import { useEffect } from "react";
import { useT } from "../i18n.jsx";

export default function Modal({ title, wide, onClose, children }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay on">
      <div className={"modal" + (wide ? " wide" : "")} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="xbtn" onClick={onClose} aria-label={t("Yopish")} title={t("Yopish")}>
          ×
        </button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
