import { PAYN, fmt, fmtArea, daysLeft, payState, debtOf } from "../utils.js";
import Icon from "./Icons.jsx";
import { useT } from "../i18n.jsx";

export default function Card({ j, idx, count, sortByDue, isAdmin, act }) {
  const t = useT();
  const ps = payState(j);
  const debt = debtOf(j);

  let dueChip = null;
  let late = false;
  if (j.due) {
    const dl = daysLeft(j.due);
    if (j.stage === 3) dueChip = <span className="chip">{t("Muddat: {0}", j.due)}</span>;
    else if (dl < 0) {
      dueChip = <span className="chip red">{t("{0} kun kechikdi", -dl)}</span>;
      late = true;
    } else if (dl === 0) dueChip = <span className="chip yel">{t("Bugun topshiriladi")}</span>;
    else if (dl <= 2) dueChip = <span className="chip yel">{t("{0} kun qoldi", dl)}</span>;
    else dueChip = <span className="chip">{t("{0} kun qoldi", dl)}</span>;
  }

  let moneyChip = null;
  if (isAdmin && j.price > 0) {
    moneyChip =
      debt > 0 ? (
        <span className={"chip " + (ps === 0 ? "red" : "yel")}>{t("Qarz: {0}", fmt(debt))}</span>
      ) : (
        <span className="chip grn">{t("To'langan")}</span>
      );
  }

  const meta = [j.material, j.thick ? j.thick + " mm" : "", j.dims].filter(Boolean).join(" · ");

  return (
    <div className={"card" + (late ? " late" : "")}>
      <div className="row1">
        <span className="tag">{t("{0} ta detal", j.parts)}</span>
        {j.area > 0 && <span>{fmtArea(j.area)} m²</span>}
        {isAdmin && (
          <button className="pay" title={t(PAYN[ps])} aria-label={t(PAYN[ps])} onClick={() => act(j, "edit")}>
            <i className={"dot d" + ps} />
          </button>
        )}
      </div>
      <div className="mid">
        <div className="txt">
          <div className="title">{j.title}</div>
          <div className="cust">{j.customer || "—"}</div>
        </div>
        {j.img && <img className="thumb" src={j.img} alt="Rasm" onClick={() => act(j, "img")} />}
      </div>
      {meta && <div className="meta">{meta}</div>}
      {j.note && <div className="meta">{j.note}</div>}
      {(dueChip || moneyChip) && (
        <div className="chips">
          {dueChip}
          {moneyChip}
        </div>
      )}
      <div className="acts">
        <button className="ic" disabled={j.stage === 0} aria-label={t("Orqaga")} title={t("Orqaga")} onClick={() => act(j, "back")}>
          <Icon name="left" />
        </button>
        <button className="ic" disabled={sortByDue || idx === 0} aria-label={t("Yuqoriga")} title={t("Yuqoriga")} onClick={() => act(j, "up")}>
          <Icon name="up" />
        </button>
        <button
          className="ic"
          disabled={sortByDue || idx === count - 1}
          aria-label={t("Pastga")}
          title={t("Pastga")}
          onClick={() => act(j, "down")}
        >
          <Icon name="down" />
        </button>
        <span className="sep" />
        {j.stage === 3 && (
          <button className="ic" title={t("Telegram orqali xabar")} aria-label={t("Telegram xabar")} onClick={() => act(j, "tg")}>
            <Icon name="send" size={14} /> {t("Xabar")}
          </button>
        )}
        <button className="ic" aria-label={t("Tahrirlash")} title={t("Tahrirlash")} onClick={() => act(j, "edit")}>
          <Icon name="edit" />
        </button>
        {isAdmin && (
          <button className="ic del" aria-label={t("Ishni o'chirish")} title={t("Ishni o'chirish")} onClick={() => act(j, "del")}>
            <Icon name="trash" />
          </button>
        )}
        {j.stage < 3 ? (
          <button className="ic go" aria-label={t("Keyingi bosqich")} title={t("Keyingi bosqich")} onClick={() => act(j, "next")}>
            <Icon name="right" />
          </button>
        ) : (
          <button
            className="ic done"
            aria-label={t("Tugatilgan ishlarga o'tkazish")}
            title={t("Tugatildi: Tugatilgan ishlar sahifasiga o'tkazish")}
            onClick={() => act(j, "finish")}
          >
            <Icon name="check" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
