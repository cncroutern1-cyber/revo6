import { useState } from "react";
import Modal from "./Modal.jsx";
import { STAGE_NAMES, uid, todayStr, resizeImg, fmt } from "../utils.js";

const MATERIALS = ["LDSP", "MDF", "Massiv", "Fanera"];

export default function JobForm({ job, isAdmin, customers, onSave, onDelete, onClose }) {
  const [f, setF] = useState({
    title: job?.title || "",
    customer: job?.customer || "",
    phone: job && customers[job.customer] ? customers[job.customer].phone || "" : "",
    parts: job?.parts || 1,
    area: job?.area || "",
    material: job?.material || "",
    thick: job?.thick || "",
    dims: job?.dims || "",
    price: job?.price || "",
    advance: job?.advance || "",
    due: job?.due || "",
    stage: job ? job.stage : 0,
    note: job?.note || "",
    img: job?.img || null,
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const names = Object.keys(customers);

  // Price minus advance, shown as soon as either is typed.
  const priceN = parseFloat(f.price) || 0;
  const advN = parseFloat(f.advance) || 0;
  const rest = priceN - advN;

  function pickCustomer(e) {
    const v = e.target.value;
    const c = customers[v.trim()];
    setF((s) => ({ ...s, customer: v, phone: c && c.phone && !s.phone ? c.phone : s.phone }));
  }

  async function pickImg(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const img = await resizeImg(file);
    setF((s) => ({ ...s, img }));
  }

  function submit() {
    const title = f.title.trim();
    if (!title) return document.getElementById("fTitle").focus();
    const stage = Number(f.stage);
    const base = job || {
      id: uid(),
      created: todayStr(),
      done: "",
      stage: 0,
      size: "katta",
      price: 0,
      advance: 0,
      pos: Date.now(),
    };
    let j = {
      ...base,
      title,
      customer: f.customer.trim(),
      parts: Math.max(1, parseInt(f.parts) || 1),
      area: Math.max(0, parseFloat(f.area) || 0),
      material: f.material.trim(),
      thick: String(f.thick || ""),
      dims: f.dims.trim(),
      due: f.due,
      note: f.note.trim(),
      img: f.img,
    };
    if (isAdmin) {
      j.price = Math.max(0, parseFloat(f.price) || 0);
      j.advance = Math.max(0, parseFloat(f.advance) || 0);
    }
    if (j.stage !== stage) {
      j = { ...j, stage, done: stage >= 3 ? j.done || todayStr() : "", pos: Date.now() };
    }
    onSave(j, f.phone.trim());
  }

  return (
    <Modal title={job ? "Ishni tahrirlash" : "Yangi ish"} onClose={onClose}>
      <div className="f">
        <label htmlFor="fTitle">Ish nomi</label>
        <input id="fTitle" type="text" value={f.title} onChange={set("title")} placeholder="Masalan: Oshxona eshiklari 3D" autoFocus />
      </div>
      <div className="two">
        <div className="f">
          <label htmlFor="fCust">Mijoz</label>
          <input id="fCust" type="text" list="custNames" value={f.customer} onChange={pickCustomer} placeholder="Sherzod aka" />
          <datalist id="custNames">
            {names.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div className="f">
          <label htmlFor="fPhone">Telefon</label>
          <input id="fPhone" type="tel" value={f.phone} onChange={set("phone")} placeholder="+998 90 123 45 67" />
        </div>
      </div>
      <div className="two">
        <div className="f">
          <label htmlFor="fParts">Detallar soni</label>
          <input id="fParts" type="number" min="1" value={f.parts} onChange={set("parts")} />
        </div>
        <div className="f">
          <label htmlFor="fArea">Detallar kvadrati (m²)</label>
          <input id="fArea" type="number" min="0" step="0.01" inputMode="decimal" value={f.area} onChange={set("area")} placeholder="0" />
        </div>
      </div>
      <div className="two">
        <div className="f">
          <label htmlFor="fMat">Material</label>
          <input id="fMat" type="text" list="matList" value={f.material} onChange={set("material")} placeholder="Tanlang yoki o'zingiz yozing" autoComplete="off" />
          <datalist id="matList">
            {MATERIALS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div className="f">
          <label htmlFor="fThick">Qalinligi (mm)</label>
          <input id="fThick" type="number" min="0" value={f.thick} onChange={set("thick")} placeholder="18" />
        </div>
      </div>
      <div className="f">
        <label htmlFor="fDims">O'lcham</label>
        <input id="fDims" type="text" value={f.dims} onChange={set("dims")} placeholder="Masalan: 2100×600" />
      </div>
      {isAdmin && (
        <>
          <div className="two">
            <div className="f">
              <label htmlFor="fPrice">Narx (so'm)</label>
              <input id="fPrice" type="number" min="0" value={f.price} onChange={set("price")} placeholder="0" />
            </div>
            <div className="f">
              <label htmlFor="fAdv">Olingan avans (so'm)</label>
              <input id="fAdv" type="number" min="0" value={f.advance} onChange={set("advance")} placeholder="0" />
            </div>
          </div>
          {(priceN > 0 || advN > 0) && (
            <div className={"rest" + (rest < 0 ? " bad" : rest === 0 ? " ok" : "")} role="status">
              {rest < 0 ? (
                <>Avans narxdan {fmt(-rest)} so'm ko'p. Summalarni tekshiring.</>
              ) : rest === 0 ? (
                <>To'liq to'langan</>
              ) : (
                <>
                  Qolgan to'lov: <b>{fmt(rest)} so'm</b>
                  <span className="calc">
                    {" "}
                    ({fmt(priceN)} − {fmt(advN)})
                  </span>
                </>
              )}
            </div>
          )}
        </>
      )}
      <div className="two">
        <div className="f">
          <label htmlFor="fDue">Topshirish muddati</label>
          <input id="fDue" type="date" value={f.due} onChange={set("due")} />
        </div>
        <div className="f">
          <label htmlFor="fStage">Bosqich</label>
          <select id="fStage" value={f.stage} onChange={set("stage")}>
            {STAGE_NAMES.map((s, i) => (
              <option key={s} value={i}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="f">
        <label htmlFor="fNote">Izoh</label>
        <textarea id="fNote" value={f.note} onChange={set("note")} placeholder="Qo'shimcha eslatma" />
      </div>
      <div className="f">
        <label htmlFor="fImg">Rasm / chizma</label>
        <div className="imgrow">
          {f.img && <img src={f.img} alt="" />}
          <label className="btn small" htmlFor="fImg" style={{ cursor: "pointer" }}>
            Rasm tanlash
          </label>
          <input id="fImg" type="file" accept="image/*" onChange={pickImg} style={{ display: "none" }} />
          {f.img && (
            <button type="button" className="btn small danger" onClick={() => setF((s) => ({ ...s, img: null }))}>
              Olib tashlash
            </button>
          )}
        </div>
      </div>
      <div className="mbtns">
        {job && isAdmin && (
          <button className="btn danger" onClick={() => onDelete(job)}>
            O'chirish
          </button>
        )}
        <span className="sp" />
        <button className="btn" onClick={onClose}>
          Bekor qilish
        </button>
        <button className="btn primary" onClick={submit}>
          Saqlash
        </button>
      </div>
    </Modal>
  );
}
