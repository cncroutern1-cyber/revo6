import { useState } from "react";
import Page from "./Page.jsx";
import JobForm from "./JobForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import Icon from "./Icons.jsx";
import { fmt, fmtArea, debtOf } from "../utils.js";

// Finished jobs: ticked off in the "Tayyor" column. Can be restored, edited or (admin) deleted.
export default function Archive({ data, isAdmin }) {
  const { jobs, customers, saveJob, removeJob, savePhone } = data;
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [bigImg, setBigImg] = useState(null);

  const query = q.trim().toLowerCase();
  const list = jobs
    .filter((j) => j.stage === 4)
    .filter((j) => !query || (j.title + " " + j.customer + " " + (j.material || "")).toLowerCase().includes(query))
    .sort((a, b) => (b.done || "").localeCompare(a.done || "") || b.pos - a.pos);
  const total = jobs.filter((j) => j.stage === 4).length;

  function restore(j) {
    saveJob({ ...j, stage: 3, pos: Date.now() });
  }

  function ask(j) {
    if (!isAdmin) return;
    setConfirm({
      title: "Ishni o'chirish",
      text: `"${j.title}" ishi hamma qurilmalardan o'chiriladi. Buni qaytarib bo'lmaydi.`,
      onYes: async () => {
        setConfirm(null);
        setForm(null);
        await removeJob(j.id);
      },
    });
  }

  async function onSave(j, phone) {
    setForm(null);
    await saveJob(j);
    if (j.customer && (phone !== ((customers[j.customer] || {}).phone || "") || !customers[j.customer])) {
      await savePhone(j.customer, phone);
    }
  }

  return (
    <Page title="Tugatilgan ishlar">
      <div className="arch-bar">
        <input type="search" placeholder="Qidirish..." aria-label="Qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="arch-count">{total} ta ish</span>
      </div>

      {list.length === 0 && (
        <div className="empty">
          {total === 0
            ? "Hali tugatilgan ish yo'q. \"Tayyor\" ustunidagi ish kartasida ✓ tugmasini bossangiz, ish shu yerga o'tadi."
            : "Topilmadi"}
        </div>
      )}

      <div className="cust-grid">
        {list.map((j) => {
          const debt = debtOf(j);
          const meta = [j.material, j.thick ? j.thick + " mm" : "", j.dims].filter(Boolean).join(" · ");
          return (
            <div className="card" key={j.id}>
              <div className="row1">
                <span className="tag">{j.parts} ta detal</span>
                {j.area > 0 && <span>{fmtArea(j.area)} m²</span>}
                <span style={{ marginLeft: "auto" }}>Tugagan: {j.done || "—"}</span>
              </div>
              <div className="mid">
                <div className="txt">
                  <div className="title">{j.title}</div>
                  <div className="cust">{j.customer || "—"}</div>
                </div>
                {j.img && <img className="thumb" src={j.img} alt="Rasm" onClick={() => setBigImg(j.img)} />}
              </div>
              {meta && <div className="meta">{meta}</div>}
              {j.note && <div className="meta">{j.note}</div>}
              {isAdmin && j.price > 0 && (
                <div className="chips">
                  {debt > 0 ? <span className="chip red">Qarz: {fmt(debt)}</span> : <span className="chip grn">To'langan</span>}
                </div>
              )}
              <div className="acts">
                <button className="ic" onClick={() => restore(j)} title="Tayyor ustuniga qaytarish">
                  <Icon name="left" /> Qaytarish
                </button>
                <span className="sep" />
                <button className="ic" aria-label="Tahrirlash" title="Tahrirlash" onClick={() => setForm({ job: j })}>
                  <Icon name="edit" />
                </button>
                {isAdmin && (
                  <button className="ic del" aria-label="Ishni o'chirish" title="Ishni o'chirish" onClick={() => ask(j)}>
                    <Icon name="trash" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {form && (
        <JobForm
          key={form.job.id}
          job={form.job}
          isAdmin={isAdmin}
          customers={customers}
          onSave={onSave}
          onDelete={ask}
          onClose={() => setForm(null)}
        />
      )}
      {confirm && (
        <ConfirmDialog title={confirm.title} text={confirm.text} onYes={confirm.onYes} onNo={() => setConfirm(null)} />
      )}
      {bigImg && (
        <div className="overlay on lightbox" onClick={() => setBigImg(null)}>
          <img src={bigImg} alt="" />
        </div>
      )}
    </Page>
  );
}
