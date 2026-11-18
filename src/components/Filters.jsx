import { daysLeft, payState } from "../utils.js";

export const NO_FILTER = { cust: "", mat: "", due: "", pay: "" };

// One job against the chosen filters (all conditions must match).
export function passes(j, f, isAdmin) {
  if (f.cust && j.customer !== f.cust) return false;
  if (f.mat && (j.material || "").trim().toLowerCase() !== f.mat.toLowerCase()) return false;
  if (f.due) {
    if (!j.due) return false;
    const d = daysLeft(j.due);
    if (f.due === "late" && !(d < 0 && j.stage < 3)) return false;
    if (f.due === "today" && d !== 0) return false;
    if (f.due === "week" && !(d >= 0 && d <= 7)) return false;
  }
  if (isAdmin && f.pay !== "") {
    if (f.pay === "debt") {
      if (payState(j) === 2) return false;
    } else if (payState(j) !== Number(f.pay)) return false;
  }
  return true;
}

export default function Filters({ jobs, f, setF, isAdmin }) {
  const custs = [...new Set(jobs.map((j) => j.customer).filter(Boolean))].sort();
  const mats = [...new Map(jobs.map((j) => (j.material || "").trim()).filter(Boolean).map((m) => [m.toLowerCase(), m])).values()].sort();
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const active = Object.values(f).some(Boolean);

  return (
    <div className="filters">
      <select aria-label="Mijoz" value={f.cust} onChange={set("cust")}>
        <option value="">Mijoz: hammasi</option>
        {custs.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select aria-label="Material" value={f.mat} onChange={set("mat")}>
        <option value="">Material: hammasi</option>
        {mats.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select aria-label="Muddat" value={f.due} onChange={set("due")}>
        <option value="">Muddat: hammasi</option>
        <option value="late">Kechikkan</option>
        <option value="today">Bugun</option>
        <option value="week">7 kun ichida</option>
      </select>
      {isAdmin && (
        <select aria-label="To'lov" value={f.pay} onChange={set("pay")}>
          <option value="">To'lov: hammasi</option>
          <option value="0">To'lanmagan</option>
          <option value="1">Avans berilgan</option>
          <option value="2">To'liq to'langan</option>
          <option value="debt">Qarzi bor</option>
        </select>
      )}
      {active && (
        <button className="btn small" onClick={() => setF(NO_FILTER)}>
          Tozalash
        </button>
      )}
    </div>
  );
}
