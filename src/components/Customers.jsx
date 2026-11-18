import Page from "./Page.jsx";
import { STAGES, fmt, debtOf } from "../utils.js";

export default function Customers({ jobs, customers, isAdmin, onPhone }) {
  const names = new Set(Object.keys(customers));
  jobs.forEach((j) => names.add((j.customer || "").trim() || "Nomsiz"));

  const rows = [...names]
    .map((n) => {
      const js = jobs.filter((j) => ((j.customer || "").trim() || "Nomsiz") === n);
      return {
        n,
        js,
        debt: js.reduce((s, j) => s + debtOf(j), 0),
        sum: js.reduce((s, j) => s + (j.price || 0), 0),
      };
    })
    .sort((a, b) => b.debt - a.debt || b.js.length - a.js.length);

  return (
    <Page title="Mijozlar">
      {rows.length === 0 && <div className="empty">Hali mijozlar yo'q</div>}
      <div className="cust-grid">
      {rows.map((r) => {
        const phone = (customers[r.n] || {}).phone || "";
        return (
          <div className="cbox" key={r.n}>
            <div className="top">
              <b>{r.n}</b>
              {isAdmin &&
                (r.debt > 0 ? (
                  <span className="debt">Qarz: {fmt(r.debt)}</span>
                ) : (
                  <span style={{ color: "var(--mute)", fontSize: 13 }}>Qarz yo'q</span>
                ))}
            </div>
            <div className="jl">
              {r.js.length} ta ish{isAdmin ? ` · jami ${fmt(r.sum)} so'm` : ""}
            </div>
            <div className="jl">
              {r.js.length === 0
                ? "Ishlar yo'q"
                : r.js.map((j) => (
                    <div key={j.id}>
                      {j.title} ({STAGES[j.stage]})
                    </div>
                  ))}
            </div>
            {r.n !== "Nomsiz" && (
              <input
                type="tel"
                key={r.n + phone}
                defaultValue={phone}
                placeholder="Telefon raqami"
                aria-label="Telefon"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== phone) onPhone(r.n, v);
                }}
              />
            )}
            {phone && (
              <div className="jl">
                <a href={"tel:" + phone} style={{ color: "var(--accent)" }}>
                  Qo'ng'iroq qilish
                </a>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </Page>
  );
}
