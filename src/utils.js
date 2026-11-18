export const STAGES = ["Navbatda", "Chizilmoqda", "O'yilmoqda", "Tayyor"];
export const PAYN = ["To'lanmagan", "Avans berilgan", "To'liq to'langan"];

// Used on the login page only if the "profiles" table can't be read yet (before supabase-foydalanuvchilar.sql is run).
export const FALLBACK_USERS = [
  { username: "Abdulloh", email: "abdulloh@ishkuzatuv.com", role: "admin" },
  { username: "Mirzabek", email: "mirzabek@ishkuzatuv.com", role: "worker" },
];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const fmt = (n) =>
  Math.round(n || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const pad = (n) => String(n).padStart(2, "0");
export const todayStr = () => {
  const d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
};

export const daysLeft = (due) =>
  Math.round((new Date(due + "T00:00:00") - new Date(todayStr() + "T00:00:00")) / 864e5);

export const payState = (j) =>
  j.price > 0 ? (j.advance >= j.price ? 2 : j.advance > 0 ? 1 : 0) : j.advance > 0 ? 1 : 0;

export const debtOf = (j) => Math.max(0, (j.price || 0) - (j.advance || 0));

export const sortJobs = (list) => list.slice().sort((a, b) => a.pos - b.pos);

export function toRow(j) {
  return {
    id: j.id,
    title: j.title,
    customer: j.customer || "",
    parts: j.parts || 1,
    size: j.size || "katta",
    stage: j.stage || 0,
    material: j.material || "",
    thick: String(j.thick || ""),
    dims: j.dims || "",
    price: j.price || 0,
    advance: j.advance || 0,
    due: j.due || "",
    note: j.note || "",
    created: j.created || todayStr(),
    done: j.done || "",
    img: j.img || null,
    pos: j.pos || Date.now(),
  };
}

export function fromRow(r) {
  return {
    ...r,
    parts: Number(r.parts),
    stage: Number(r.stage),
    price: Number(r.price),
    advance: Number(r.advance),
    pos: Number(r.pos),
  };
}

export function resizeImg(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 800 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * s);
        c.height = Math.round(im.height * s);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.65));
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
