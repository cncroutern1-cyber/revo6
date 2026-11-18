import { useState } from "react";
import { STAGES, fmt, debtOf, todayStr } from "../utils.js";
import Card from "./Card.jsx";
import JobForm from "./JobForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { useT } from "../i18n.jsx";

// The main page: search, sort, "+ Yangi ish" and the four-column board.
export default function Jobs({ data, isAdmin }) {
  const t = useT();
  const { jobs, customers, materialPrices, saveMaterialPrice, saveJob, removeJob, removeMany, savePhone, reorder } = data;
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // { job } (job is null for a new one)
  const [confirm, setConfirm] = useState(null);
  const [bigImg, setBigImg] = useState(null);
  // "Kichraytirish": cards of a column (or of every column) shrink to one line; one card can still be opened with its own button.
  const [cmp, setCmp] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem("ish-kuzatuv-compact") || "[]");
      return [0, 1, 2, 3].map((i) => v[i] === true);
    } catch (e) {
      return [false, false, false, false];
    }
  });
  const saveCmp = (v) => {
    try {
      localStorage.setItem("ish-kuzatuv-compact", JSON.stringify(v));
    } catch (e) {}
    return v;
  };
  const allCompact = cmp.every(Boolean);
  const toggleAll = () => setCmp(saveCmp(cmp.map(() => !allCompact)));
  const toggleCol = (s) => setCmp(saveCmp(cmp.map((c, i) => (i === s ? !c : c))));

  const sortByDue = false;
  const query = q.trim().toLowerCase();

  function act(j, a) {
    if (a === "next" && j.stage < 3) {
      const s = j.stage + 1;
      saveJob({ ...j, stage: s, done: s === 3 ? todayStr() : "", pos: Date.now() });
    } else if (a === "back" && j.stage > 0) {
      const s = j.stage - 1;
      saveJob({ ...j, stage: s, done: "", pos: Date.now() });
    } else if (a === "finish") {
      saveJob({ ...j, stage: 4, done: j.done || todayStr(), pos: Date.now() });
    } else if (a === "up") reorder(j, -1);
    else if (a === "down") reorder(j, 1);
    else if (a === "edit") setForm({ job: j });
    else if (a === "img") setBigImg(j.img);
    else if (a === "del") onDelete(j);
    else if (a === "tg") {
      const d = isAdmin ? debtOf(j) : 0;
      const msg =
        `Assalomu alaykum${j.customer ? ", " + j.customer : ""}! "${j.title}" ishingiz tayyor.` +
        (d > 0 ? ` Qolgan to'lov: ${fmt(d)} so'm.` : "") +
        " Olib ketishingiz mumkin.";
      window.open("https://t.me/share/url?url=%20&text=" + encodeURIComponent(msg), "_blank");
    }
  }

  async function onSave(j, phone) {
    setForm(null);
    await saveJob(j);
    if (j.customer && phone !== ((customers[j.customer] || {}).phone || "")) {
      await savePhone(j.customer, phone);
    } else if (j.customer && !customers[j.customer]) {
      await savePhone(j.customer, phone);
    }
  }

  function onDelete(j) {
    if (!isAdmin) return;
    setConfirm({
      title: t("Ishni o'chirish"),
      text: t("\"{0}\" ishi hamma qurilmalardan o'chiriladi. Buni qaytarib bo'lmaydi.", j.title),
      onYes: async () => {
        setConfirm(null);
        setForm(null);
        await removeJob(j.id);
      },
    });
  }

  return (
    <>
      <div className="toolbar">
        <input type="search" placeholder={t("Qidirish...")} aria-label={t("Qidirish")} value={q} onChange={(e) => setQ(e.target.value)} />
        {isAdmin && (
          <div className="legend">
            <span><i className="dot d0" />{t("To'lanmagan")}</span>
            <span><i className="dot d1" />{t("Avans berilgan")}</span>
            <span><i className="dot d2" />{t("To'liq to'langan")}</span>
          </div>
        )}
        <div className="spacer" />
        <button className="btn" onClick={toggleAll} title={allCompact ? t("Hamma ishni kattalashtirish") : t("Hamma ishni kichraytirish")}>
          {allCompact ? t("⤢ Kattalashtirish") : t("⤡ Kichraytirish")}
        </button>
        <button className="btn primary" onClick={() => setForm({ job: null })}>
          {t("+ Yangi ish")}
        </button>
      </div>

      <main>
        {STAGES.map((name, s) => {
          let items = jobs.filter((j) => j.stage === s);
          const total = items.length;
          const shown = items.filter(
            (j) => !query || (j.title + " " + j.customer + " " + (j.material || "")).toLowerCase().includes(query)
          );
          return (
            <section className="col" key={name}>
              <h2>
                <i className="stagebar" />
                {t(name)}
                <span className="n">{total}</span>
                <button className="ic colbtn" onClick={() => toggleCol(s)} title={cmp[s] ? t("Kattalashtirish") : t("Kichraytirish")} aria-label={cmp[s] ? t("Kattalashtirish") : t("Kichraytirish")}>
                  {cmp[s] ? "⤢" : "⤡"}
                </button>
              </h2>
              <div className="list">
                {shown.length === 0 && <div className="empty">{query ? t("Topilmadi") : t("Bo'sh")}</div>}
                {shown.map((j) => (
                  <Card
                    key={j.id + (cmp[s] ? "-c" : "")}
                    compact={cmp[s]}
                    j={j}
                    idx={items.indexOf(j)}
                    count={items.length}
                    sortByDue={sortByDue}
                    isAdmin={isAdmin}
                    act={act}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {form && (
        <JobForm
          key={form.job ? form.job.id : "new"}
          job={form.job}
          isAdmin={isAdmin}
          customers={customers}
          materialPrices={materialPrices}
          onSaveMaterialPrice={saveMaterialPrice}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => setForm(null)}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          text={confirm.text}
          yes={confirm.yes}
          tone={confirm.tone}
          onYes={confirm.onYes}
          onNo={() => setConfirm(null)}
        />
      )}
      {bigImg && (
        <div className="overlay on lightbox" onClick={() => setBigImg(null)}>
          <button type="button" className="xbtn light" onClick={() => setBigImg(null)} aria-label="×">
            ×
          </button>
          <img src={bigImg} alt="" />
        </div>
      )}
    </>
  );
}
