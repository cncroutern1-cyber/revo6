import { PAYN, fmt, fmtArea, daysLeft, payState, debtOf } from "../utils.js";
import Icon from "./Icons.jsx";

export default function Card({ j, idx, count, sortByDue, isAdmin, act }) {
  const ps = payState(j);
  const debt = debtOf(j);

  let dueChip = null;
  let late = false;
  if (j.due) {
    const dl = daysLeft(j.due);
    if (j.stage === 3) dueChip = <span className="chip">Muddat: {j.due}</span>;
    else if (dl < 0) {
      dueChip = <span className="chip red">{-dl} kun kechikdi</span>;
      late = true;
    } else if (dl === 0) dueChip = <span className="chip yel">Bugun topshiriladi</span>;
    else if (dl <= 2) dueChip = <span className="chip yel">{dl} kun qoldi</span>;
    else dueChip = <span className="chip">{dl} kun qoldi</span>;
  }

  let moneyChip = null;
  if (isAdmin && j.price > 0) {
    moneyChip =
      debt > 0 ? (
        <span className={"chip " + (ps === 0 ? "red" : "yel")}>Qarz: {fmt(debt)}</span>
      ) : (
        <span className="chip grn">To'langan</span>
      );
  }

  const meta = [j.material, j.thick ? j.thick + " mm" : "", j.dims].filter(Boolean).join(" · ");

  return (
    <div className={"card" + (late ? " late" : "")}>
      <div className="row1">
        <span className="tag">{j.parts} ta detal</span>
        {j.area > 0 && <span>{fmtArea(j.area)} m²</span>}
        {isAdmin && (
          <button className="pay" title={PAYN[ps]} aria-label={PAYN[ps]} onClick={() => act(j, "edit")}>
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
        <button className="ic" disabled={j.stage === 0} aria-label="Orqaga" title="Orqaga" onClick={() => act(j, "back")}>
          <Icon name="left" />
        </button>
        <button className="ic" disabled={sortByDue || idx === 0} aria-label="Yuqoriga" title="Yuqoriga" onClick={() => act(j, "up")}>
          <Icon name="up" />
        </button>
        <button
          className="ic"
          disabled={sortByDue || idx === count - 1}
          aria-label="Pastga"
          title="Pastga"
          onClick={() => act(j, "down")}
        >
          <Icon name="down" />
        </button>
        <span className="sep" />
        {j.stage === 3 && (
          <button className="ic" title="Telegram orqali xabar" aria-label="Telegram xabar" onClick={() => act(j, "tg")}>
            <Icon name="send" size={14} /> Xabar
          </button>
        )}
        <button className="ic" aria-label="Tahrirlash" title="Tahrirlash" onClick={() => act(j, "edit")}>
          <Icon name="edit" />
        </button>
        {isAdmin && (
          <button className="ic del" aria-label="Ishni o'chirish" title="Ishni o'chirish" onClick={() => act(j, "del")}>
            <Icon name="trash" />
          </button>
        )}
        {j.stage < 3 ? (
          <button className="ic go" aria-label="Keyingi bosqich" title="Keyingi bosqich" onClick={() => act(j, "next")}>
            <Icon name="right" />
          </button>
        ) : (
          <button
            className="ic done"
            aria-label="Tugatilgan ishlarga o'tkazish"
            title="Tugatildi: Tugatilgan ishlar sahifasiga o'tkazish"
            onClick={() => act(j, "finish")}
          >
            <Icon name="check" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
