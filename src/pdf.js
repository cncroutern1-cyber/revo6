import { STAGE_NAMES, fmt, fmtArea } from "./utils.js";

const W = 1240; // A4 at 150 dpi
const H = 1754;
const M = 90;

function wrap(ctx, text, maxW) {
  const out = [];
  String(text).split("\n").forEach((para) => {
    let line = "";
    para.split(/\s+/).forEach((w) => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = test;
    });
    out.push(line);
  });
  return out;
}

const loadImg = (src) =>
  new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });

// Wraps one JPEG in a minimal single-page A4 PDF.
function jpegToPdf(jpeg, wpx, hpx) {
  const enc = new TextEncoder();
  const parts = [];
  const offs = [];
  let len = 0;
  const push = (d) => {
    const b = typeof d === "string" ? enc.encode(d) : d;
    parts.push(b);
    len += b.length;
  };
  const obj = (n, body) => {
    offs[n] = len;
    push(`${n} 0 obj\n`);
    body();
    push("\nendobj\n");
  };
  push("%PDF-1.4\n");
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  obj(3, () => push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"));
  obj(4, () => {
    push(`<< /Type /XObject /Subtype /Image /Width ${wpx} /Height ${hpx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    push(jpeg);
    push("\nendstream");
  });
  const content = "q 595.28 0 0 841.89 0 0 cm /Im0 Do Q";
  obj(5, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  const xref = len;
  push("xref\n0 6\n0000000000 65535 f \n");
  for (let i = 1; i <= 5; i++) push(String(offs[i]).padStart(10, "0") + " 00000 n \n");
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const all = new Uint8Array(len);
  let p = 0;
  parts.forEach((b) => {
    all.set(b, p);
    p += b.length;
  });
  return all;
}

// Draws the job sheet and downloads it as a real .pdf file.
export async function downloadJobPdf(j, { t, isAdmin, phone }) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  const F = '"Inter","Segoe UI",Roboto,Arial,sans-serif';
  let y = M;

  ctx.fillStyle = "#111";
  ctx.font = `700 40px Georgia,serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("R E V O", M, y + 30);
  ctx.font = `400 24px ${F}`;
  ctx.fillStyle = "#555";
  ctx.textAlign = "right";
  ctx.fillText(`${t("Qabul qilingan sana")}: ${j.created || ""}`, W - M, y + 28);
  ctx.textAlign = "left";
  y += 52;
  ctx.fillStyle = "#111";
  ctx.fillRect(M, y, W - 2 * M, 3);
  y += 56;

  ctx.font = `700 48px ${F}`;
  wrap(ctx, j.title, W - 2 * M).forEach((l) => {
    ctx.fillText(l, M, y);
    y += 58;
  });
  y += 14;

  const row = (k, v) => {
    if (v === "" || v == null) return;
    ctx.font = `400 26px ${F}`;
    const lines = wrap(ctx, v, W - 2 * M - 380);
    const h = lines.length * 36 + 22;
    ctx.fillStyle = "#555";
    ctx.fillText(k, M + 8, y + 30);
    ctx.fillStyle = "#111";
    lines.forEach((l, i) => ctx.fillText(l, M + 380, y + 30 + i * 36));
    y += h;
    ctx.fillStyle = "#ddd";
    ctx.fillRect(M, y, W - 2 * M, 2);
  };
  row(t("Mijoz"), j.customer);
  row(t("Telefon"), phone);
  row(t("Detallar soni"), j.parts);
  row(t("Detallar kvadrati (m²)"), j.area > 0 ? fmtArea(j.area) : "");
  row(t("Material"), [j.material, j.thick ? j.thick + " mm" : ""].filter(Boolean).join(", ") + (j.matOurs ? ` (${t("bizdan")})` : ""));
  row(t("Rangi"), j.color ? t(j.color) : "");
  row(t("O'lcham"), j.dims);
  row(t("Topshirish muddati"), j.due);
  row(t("Bosqich"), t(STAGE_NAMES[j.stage] || ""));
  row(t("Izoh"), j.note);
  row(t("Fayl"), j.fileName);

  if (isAdmin) {
    y += 36;
    const lines = [];
    if (j.priceMode === "list" && j.rate > 0) lines.push([`${t("Rover xizmati")}: ${fmt(j.lists)} ${t("list")} × ${fmt(j.rate)}`, fmt(j.lists * j.rate)]);
    else if (j.rate > 0 && j.area > 0) lines.push([`${t("Rover xizmati")}: ${fmtArea(j.area)} m² × ${fmt(j.rate)}`, fmt(j.area * j.rate)]);
    if (j.matOurs && j.matPrice > 0) lines.push([`${t("Material")} (${t("bizdan")})`, fmt(j.matPrice)]);
    const rest = Math.max(0, (j.price || 0) - (j.advance || 0));
    const line = (a, b, bold) => {
      ctx.font = `${bold ? 700 : 400} ${bold ? 30 : 26}px ${F}`;
      ctx.fillStyle = "#111";
      ctx.textAlign = "left";
      ctx.fillText(a, M + 8, y + 30);
      ctx.textAlign = "right";
      ctx.fillText(`${b} ${t("so'm")}`, W - M - 8, y + 30);
      ctx.textAlign = "left";
      y += 46;
      ctx.fillStyle = bold ? "#111" : "#ddd";
      ctx.fillRect(M, y, W - 2 * M, bold ? 3 : 2);
    };
    lines.forEach(([a, b]) => line(a, b));
    line(t("Jami narx"), fmt(j.price), true);
    line(t("Olingan avans (so'm)"), fmt(j.advance));
    line(t("Qolgan to'lov:"), fmt(rest), true);
  }

  if (j.img) {
    const im = await loadImg(j.img);
    if (im) {
      const maxH = Math.max(0, H - 120 - (y + 40));
      const s = Math.min((W - 2 * M) / im.width, maxH / im.height, 1);
      if (s > 0.15) {
        const w = im.width * s;
        const h = im.height * s;
        ctx.drawImage(im, M, y + 40, w, h);
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(M, y + 40, w, h);
      }
    }
  }
  ctx.font = `400 22px ${F}`;
  ctx.fillStyle = "#777";
  ctx.fillText("Revo shirmalar · CNC Rover", M, H - 70);

  const data = atob(c.toDataURL("image/jpeg", 0.92).split(",")[1]);
  const jpeg = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) jpeg[i] = data.charCodeAt(i);
  const pdf = jpegToPdf(jpeg, W, H);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  a.download = (j.title || "ish").replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 60) + ".pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}
