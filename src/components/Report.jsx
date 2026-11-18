import { useState } from "react";
import Page from "./Page.jsx";
import { STAGE_NAMES, fmt, todayStr, daysLeft, debtOf, download } from "../utils.js";

export default function Report({ jobs, customers, onRestore, onWipe }) {
  const [month, setMonth] = useState(todayStr().slice(0, 7));

  const done = jobs.filter((j) => j.done && j.done.startsWith(month));
  const created = jobs.filter((j) => (j.created || "").startsWith(month));
  const sum = done.reduce((s, j) => s + (j.price || 0), 0);
  const got = done.reduce((s, j) => s + Math.min(j.advance || 0, j.price || 0), 0);
  const allDebt = jobs.reduce((s, j) => s + debtOf(j), 0);
  const open = jobs.filter((j) => j.stage < 3);
  const late = open.filter((j) => j.due && daysLeft(j.due) < 0);

  const by = {};
  done.forEach((j) => {
    const k = (j.customer || "").trim() || "Nomsiz";
    by[k] = by[k] || { n: 0, s: 0 };
    by[k].n++;
    by[k].s += j.price || 0;
  });
  const top = Object.entries(by)
    .sort((a, b) => b[1].s - a[1].s)
    .slice(0, 5);

  function csv() {
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const head = ["Ish", "Mijoz", "Telefon", "Bosqich", "Detal", "Kvadrat (m2)", "Material", "Qalinlik", "O'lcham", "Narx", "Avans", "Qarz", "Muddat", "Qabul sanasi", "Tayyor bo'lgan sana", "Izoh"];
    const rows = jobs.map((j) =>
      [j.title, j.customer, (customers[j.customer] || {}).phone || "", STAGE_NAMES[j.stage], j.parts, j.area || 0, j.material, j.thick, j.dims, j.price, j.advance, debtOf(j), j.due, j.created, j.done, j.note]
        .map(q)
        .join(",")
    );
    download("ishlar.csv", "﻿" + [head.map(q).join(",")].concat(rows).join("\r\n"), "text/csv;charset=utf-8");
  }

  function backup() {
    download("ish-zaxira-" + todayStr() + ".json", JSON.stringify({ jobs, customers }), "application/json");
  }

  async function restore(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d.jobs)) throw new Error("bad");
      if (!window.confirm(d.jobs.length + " ta ish yuklanadi. Bir xil ishlar yangilanadi, qolganlari saqlanib qoladi. Davom etasizmi?")) return;
      await onRestore(d);
    } catch {
      window.alert("Fayl noto'g'ri.");
    }
  }

  async function wipe() {
    if (!window.confirm("Barcha ishlar va mijozlar hamma qurilmalardan o'chiriladi. Aniq o'chiraymi?")) return;
    if (!window.confirm("Oxirgi marta so'rayman: qaytarib bo'lmaydi.")) return;
    await onWipe();
  }

  return (
    <Page title="Hisobot">
      <div className="f">
        <label htmlFor="rMonth">Oy</label>
        <input id="rMonth" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      <div className="stats">
        <div className="stat"><b>{done.length}</b><span>Shu oy tugatilgan ishlar</span></div>
        <div className="stat"><b>{created.length}</b><span>Shu oy qabul qilingan ishlar</span></div>
        <div className="stat"><b>{fmt(sum)}</b><span>Tugatilgan ishlar summasi (so'm)</span></div>
        <div className="stat"><b>{fmt(got)}</b><span>Shundan olingan (so'm)</span></div>
        <div className="stat"><b>{fmt(allDebt)}</b><span>Jami qarz (so'm)</span></div>
        <div className="stat">
          <b>{open.length}</b>
          <span>Jarayondagi ishlar{late.length ? `, ${late.length} tasi kechikkan` : ""}</span>
        </div>
      </div>
      <div className="sub">Shu oy eng ko'p ish bergan mijozlar</div>
      {top.length === 0 && <div className="empty">Bu oyda tugatilgan ish yo'q</div>}
      {top.map(([n, v]) => (
        <div className="line" key={n}>
          <span>{n}</span>
          <span>{v.n} ta · {fmt(v.s)} so'm</span>
        </div>
      ))}
      <div className="sub">Ma'lumotlar</div>
      <div className="mbtns" style={{ marginTop: 0 }}>
        <button className="btn small" onClick={csv}>Excelga yuklab olish</button>
        <button className="btn small" onClick={backup}>Zaxira nusxa</button>
        <label className="btn small" htmlFor="fRestore" style={{ cursor: "pointer" }}>Zaxiradan yuklash</label>
        <input id="fRestore" type="file" accept=".json,application/json" onChange={restore} style={{ display: "none" }} />
      </div>
      <div className="mbtns">
        <button className="btn small danger" onClick={wipe}>Hammasini tozalash</button>
      </div>
    </Page>
  );
}
