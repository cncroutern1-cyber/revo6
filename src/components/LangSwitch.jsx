import { LANGS, useLang } from "../i18n.jsx";

// UZ | RU | EN toggle. The choice is remembered on this device.
export default function LangSwitch({ className = "" }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={"lang " + className} role="group" aria-label={t("Til")}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          className={lang === l.id ? "on" : ""}
          aria-pressed={lang === l.id}
          title={l.name}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
