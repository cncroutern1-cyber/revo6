import { STAGE_NAMES, fmt, fmtArea } from "./utils.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Builds a one-page job sheet and opens the browser's print dialog, where "Save as PDF" stores it as a PDF file.
export function printJob(j, { t, isAdmin, phone }) {
  const rows = [];
  const add = (k, v) => v !== "" && v != null && rows.push(`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`);
  add(t("Mijoz"), j.customer);
  add(t("Telefon"), phone);
  add(t("Detallar soni"), j.parts);
  add(t("Detallar kvadrati (m²)"), j.area > 0 ? fmtArea(j.area) : "");
  add(t("Material"), [j.material, j.thick ? j.thick + " mm" : ""].filter(Boolean).join(", "));
  add(t("O'lcham"), j.dims);
  add(t("Topshirish muddati"), j.due);
  add(t("Bosqich"), t(STAGE_NAMES[j.stage] || ""));
  add(t("Izoh"), j.note);
  let money = "";
  if (isAdmin) {
    const lines = [];
    if (j.rate > 0 && j.area > 0)
      lines.push([`${t("Rover xizmati")}: ${fmtArea(j.area)} m² × ${fmt(j.rate)}`, fmt(j.area * j.rate)]);
    if (j.matOurs && j.matPrice > 0) lines.push([`${t("Material")} (${t("bizdan")})`, fmt(j.matPrice)]);
    const rest = Math.max(0, (j.price || 0) - (j.advance || 0));
    money = `<table class="m">${lines.map(([a, b]) => `<tr><td>${esc(a)}</td><td class="r">${b} ${esc(t("so'm"))}</td></tr>`).join("")}
      <tr class="tot"><td>${esc(t("Jami narx"))}</td><td class="r">${fmt(j.price)} ${esc(t("so'm"))}</td></tr>
      <tr><td>${esc(t("Olingan avans (so'm)"))}</td><td class="r">${fmt(j.advance)} ${esc(t("so'm"))}</td></tr>
      <tr class="tot"><td>${esc(t("Qolgan to'lov:"))}</td><td class="r">${fmt(rest)} ${esc(t("so'm"))}</td></tr></table>`;
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(j.title)}</title><style>
  @page{size:A4;margin:16mm}
  body{font:14px/1.45 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;margin:0}
  .top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:18px}
  .brand{font:700 20px Georgia,serif;letter-spacing:.2em}.date{color:#555}
  h1{font-size:24px;margin:0 0 14px}
  table{border-collapse:collapse;width:100%}
  th{text-align:left;width:38%;color:#555;font-weight:500;padding:7px 8px;border-bottom:1px solid #ddd;vertical-align:top}
  td{padding:7px 8px;border-bottom:1px solid #ddd;white-space:pre-wrap}
  .m{margin-top:20px}.m td{font-size:14px}.r{text-align:right;white-space:nowrap}.tot td{font-weight:700;font-size:16px;border-bottom:2px solid #111}
  img{max-width:100%;max-height:90mm;margin-top:18px;border:1px solid #ddd}
  .foot{margin-top:28px;color:#777;font-size:12px}
  </style></head><body>
  <div class="top"><div class="brand">REVO</div><div class="date">${esc(t("Qabul qilingan sana"))}: ${esc(j.created || "")}</div></div>
  <h1>${esc(j.title)}</h1><table>${rows.join("")}</table>${money}
  ${j.img ? `<img src="${j.img}" alt="">` : ""}
  <div class="foot">Revo shirmalar · CNC Rover</div></body></html>`;

  const fr = document.createElement("iframe");
  fr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(fr);
  fr.srcdoc = html;
  fr.onload = () => {
    setTimeout(() => {
      try {
        fr.contentWindow.focus();
        fr.contentWindow.print();
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => fr.remove(), 60000);
    }, 300);
  };
}
