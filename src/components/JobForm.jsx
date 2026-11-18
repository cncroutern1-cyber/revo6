import { useState } from "react";
import Modal from "./Modal.jsx";
import { STAGE_NAMES, uid, todayStr, resizeImg, fmt, fmtArea, COLORS } from "../utils.js";
import { useT } from "../i18n.jsx";
import { downloadJobPdf } from "../pdf.js";
import { sb } from "../supabase.js";

const MATERIALS = ["LDSP", "MDF", "Massiv", "Fanera"];

export default function JobForm({ job, isAdmin, customers, materialPrices = {}, onSaveMaterialPrice, onSave, onDelete, onClose }) {
  const t = useT();
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
    rate: job?.rate || "",
    color: job?.color || "",
    fileName: job?.fileName || "",
    filePath: job?.filePath || "",
    matOurs: !!job?.matOurs,
    matPrice: job?.matPrice || "",
    matRate: "",
    advance: job?.advance || "",
    due: job?.due || "",
    stage: job ? job.stage : 0,
    note: job?.note || "",
    img: job?.img || null,
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const names = Object.keys(customers);

  // Price minus advance, shown as soon as either is typed.
  // Rover service = area × price per m² (if a rate is entered; otherwise the manual price). Material is added only when we supply it.
  const areaN = parseFloat(f.area) || 0;
  const rateN = parseFloat(f.rate) || 0;
  const service = rateN > 0 ? Math.round(areaN * rateN) : parseFloat(f.price) || 0;
  const hasMat = f.material.trim() !== "";
  const matKey = Object.keys(materialPrices).find((k) => k.toLowerCase() === f.material.trim().toLowerCase());
  const listRate = matKey ? materialPrices[matKey] : 0;
  const matRateN = parseFloat(f.matRate) || 0;
  const matCost = matRateN > 0 ? Math.round(areaN * matRateN) : parseFloat(f.matPrice) || 0;
  const matN = hasMat && f.matOurs ? matCost : 0;
  const [saved, setSaved] = useState(false);
  const priceN = service + matN;
  const advN = parseFloat(f.advance) || 0;
  const rest = priceN - advN;

  function pickCustomer(e) {
    const v = e.target.value;
    const c = customers[v.trim()];
    setF((s) => ({ ...s, customer: v, phone: c && c.phone && !s.phone ? c.phone : s.phone }));
  }

  const [up, setUp] = useState("");
  async function pickFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return setUp(t("Fayl 20 MB dan katta"));
    setUp(t("Yuklanmoqda..."));
    const path = uid() + "-" + file.name.replace(/[^\w.\-]+/g, "_");
    const { error } = await sb.storage.from("job-files").upload(path, file);
    if (error) return setUp(t("Yuklab bo'lmadi") + ": " + error.message);
    setUp("");
    setF((s) => ({ ...s, fileName: file.name, filePath: path }));
  }

  async function pickImg(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const img = await resizeImg(file);
    setF((s) => ({ ...s, img }));
  }

  function submit(pdf) {
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
      color: hasMat ? f.color.trim() : "",
      fileName: f.fileName,
      filePath: f.filePath,
      due: f.due,
      note: f.note.trim(),
      img: f.img,
    };
    if (isAdmin) {
      j.rate = Math.max(0, rateN);
      j.matOurs = hasMat && !!f.matOurs;
      j.matPrice = j.matOurs ? Math.max(0, matCost) : 0;
      j.price = Math.max(0, priceN);
      j.advance = Math.max(0, parseFloat(f.advance) || 0);
    }
    if (j.stage !== stage) {
      j = { ...j, stage, done: stage >= 3 ? j.done || todayStr() : "", pos: Date.now() };
    }
    onSave(j, f.phone.trim());
    if (pdf === true) downloadJobPdf(j, { t, isAdmin, phone: f.phone.trim() });
  }

  return (
    <Modal title={job ? t("Ishni tahrirlash") : t("Yangi ish")} onClose={onClose}>
      <div className="f">
        <label htmlFor="fTitle">{t("Ish nomi")}</label>
        <input id="fTitle" type="text" value={f.title} onChange={set("title")} placeholder={t("Masalan: Oshxona eshiklari 3D")} autoFocus />
      </div>
      <div className="two">
        <div className="f">
          <label htmlFor="fCust">{t("Mijoz")}</label>
          <input id="fCust" type="text" list="custNames" value={f.customer} onChange={pickCustomer} placeholder="Sherzod aka" />
          <datalist id="custNames">
            {names.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div className="f">
          <label htmlFor="fPhone">{t("Telefon")}</label>
          <input id="fPhone" type="tel" value={f.phone} onChange={set("phone")} placeholder="+998 90 123 45 67" />
        </div>
      </div>
      <div className="two">
        <div className="f">
          <label htmlFor="fParts">{t("Detallar soni")}</label>
          <input id="fParts" type="number" min="1" value={f.parts} onChange={set("parts")} />
        </div>
        <div className="f">
          <label htmlFor="fArea">{t("Detallar kvadrati (m²)")}</label>
          <input id="fArea" type="number" min="0" step="0.01" inputMode="decimal" value={f.area} onChange={set("area")} placeholder="0" />
        </div>
      </div>
      <div className="two">
        <div className="f">
          <label htmlFor="fMat">{t("Material")}</label>
          <input id="fMat" type="text" list="matList" value={f.material} onChange={set("material")} placeholder={t("Tanlang yoki o'zingiz yozing")} autoComplete="off" />
          <datalist id="matList">
            {MATERIALS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div className="f">
          <label htmlFor="fThick">{t("Qalinligi (mm)")}</label>
          <input id="fThick" type="number" min="0" value={f.thick} onChange={set("thick")} placeholder="18" />
        </div>
      </div>
      {hasMat && (
        <div className="f">
          <label htmlFor="fColor">{t("Rangi")}</label>
          <div className="swatches">
            {COLORS.map(([n, hex]) => (
              <button type="button" key={n} className={"sw" + (f.color === n ? " on" : "")} onClick={() => setF((s) => ({ ...s, color: s.color === n ? "" : n }))} title={t(n)} aria-label={t(n)} aria-pressed={f.color === n}>
                <i style={{ background: hex }} />
                {t(n)}
              </button>
            ))}
          </div>
          <input id="fColor" type="text" value={f.color} onChange={set("color")} placeholder={t("Yoki rangni o'zingiz yozing")} />
        </div>
      )}
      <div className="f">
        <label htmlFor="fDims">{t("O'lcham")}</label>
        <input id="fDims" type="text" value={f.dims} onChange={set("dims")} placeholder={t("Masalan: 2100×600")} />
      </div>
      {isAdmin && (
        <>
          {hasMat && (
            <div className="f">
              <label className="chk">
                <input type="checkbox" checked={f.matOurs} onChange={(e) => setF((s) => ({ ...s, matOurs: e.target.checked }))} />
                {t("Material bizdan beriladi")}
              </label>
              {f.matOurs && (
                <>
                  <div className="two">
                    <div>
                      <label htmlFor="fMatRate">{t("Material narxi (so'm / m²)")}</label>
                      <input id="fMatRate" type="number" min="0" value={f.matRate} onChange={(e) => { setSaved(false); set("matRate")(e); }} placeholder={listRate ? fmt(listRate) : "0"} />
                    </div>
                    <div>
                      <label>{t("Material narxi")}</label>
                      {matRateN > 0 ? (
                        <div className="calcbox">{fmtArea(areaN)} m² × {fmt(matRateN)} = <b>{fmt(matCost)}</b></div>
                      ) : (
                        <input id="fMatPrice" type="number" min="0" value={f.matPrice} onChange={set("matPrice")} placeholder={t("Material narxi (so'm)")} aria-label={t("Material narxi (so'm)")} />
                      )}
                    </div>
                  </div>
                  <div className="matlist">
                    {listRate > 0 && matRateN !== listRate && (
                      <button type="button" className="btn small" onClick={() => setF((s) => ({ ...s, matRate: String(listRate) }))}>
                        {t("Ro'yxatdagi narx")}: {fmt(listRate)}
                      </button>
                    )}
                    {matRateN > 0 && matRateN !== listRate && (
                      <button type="button" className="btn small" onClick={() => { onSaveMaterialPrice && onSaveMaterialPrice(f.material, matRateN); setSaved(true); }}>
                        {t("Narxni ro'yxatga saqlash")}
                      </button>
                    )}
                    {saved && <span className="meta">✓ {t("Saqlandi")}</span>}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="two">
            <div className="f">
              <label htmlFor="fRate">{t("Rover xizmati narxi (so'm / m²)")}</label>
              <input id="fRate" type="number" min="0" value={f.rate} onChange={set("rate")} placeholder="0" />
            </div>
            {rateN > 0 ? (
              <div className="f">
                <label>{t("Xizmat narxi")}</label>
                <div className="calcbox">{fmtArea(areaN)} m² × {fmt(rateN)} = <b>{fmt(service)}</b></div>
              </div>
            ) : (
              <div className="f">
                <label htmlFor="fPrice">{t("Narx (so'm)")}</label>
                <input id="fPrice" type="number" min="0" value={f.price} onChange={set("price")} placeholder="0" />
              </div>
            )}
          </div>
          {priceN > 0 && (matN > 0 || rateN > 0) && (
            <div className="rest ok" role="status">
              {t("Jami narx")}: <b>{fmt(priceN)} {t("so'm")}</b>
              {matN > 0 && <span className="calc"> ({fmt(service)} + {t("material")} {fmt(matN)})</span>}
            </div>
          )}
          <div className="f">
            <label htmlFor="fAdv">{t("Olingan avans (so'm)")}</label>
            <input id="fAdv" type="number" min="0" value={f.advance} onChange={set("advance")} placeholder="0" />
          </div>
          {(priceN > 0 || advN > 0) && (
            <div className={"rest" + (rest < 0 ? " bad" : rest === 0 ? " ok" : "")} role="status">
              {rest < 0 ? (
                <>{t("Avans narxdan {0} so'm ko'p. Summalarni tekshiring.", fmt(-rest))}</>
              ) : rest === 0 ? (
                <>{t("To'liq to'langan")}</>
              ) : (
                <>
                  {t("Qolgan to'lov:")} <b>{fmt(rest)} {t("so'm")}</b>
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
          <label htmlFor="fDue">{t("Topshirish muddati")}</label>
          <input id="fDue" type="date" value={f.due} onChange={set("due")} />
        </div>
        <div className="f">
          <label htmlFor="fStage">{t("Bosqich")}</label>
          <select id="fStage" value={f.stage} onChange={set("stage")}>
            {STAGE_NAMES.map((s, i) => (
              <option key={t(s)} value={i}>
                {t(s)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="f">
        <label htmlFor="fNote">{t("Izoh")}</label>
        <textarea id="fNote" value={f.note} onChange={set("note")} placeholder={t("Qo'shimcha eslatma")} />
      </div>
      <div className="f">
        <label htmlFor="fFile">{t("Fayl biriktirish")}</label>
        <div className="imgrow">
          <label className="btn small" htmlFor="fFile" style={{ cursor: "pointer" }}>
            {t("Fayl tanlash")}
          </label>
          <input id="fFile" type="file" onChange={pickFile} style={{ display: "none" }} />
          {f.fileName && <span className="fname">📎 {f.fileName}</span>}
          {f.fileName && (
            <button type="button" className="btn small danger" onClick={() => setF((s) => ({ ...s, fileName: "", filePath: "" }))}>
              {t("Olib tashlash")}
            </button>
          )}
        </div>
        {up && <div className="meta">{up}</div>}
      </div>
      <div className="f">
        <label htmlFor="fImg">{t("Rasm / chizma")}</label>
        <div className="imgrow">
          {f.img && <img src={f.img} alt="" />}
          <label className="btn small" htmlFor="fImg" style={{ cursor: "pointer" }}>
            {t("Rasm tanlash")}
          </label>
          <input id="fImg" type="file" accept="image/*" onChange={pickImg} style={{ display: "none" }} />
          {f.img && (
            <button type="button" className="btn small danger" onClick={() => setF((s) => ({ ...s, img: null }))}>
              {t("Olib tashlash")}
            </button>
          )}
        </div>
      </div>
      <div className="mbtns">
        {job && isAdmin && (
          <button className="btn danger" onClick={() => onDelete(job)}>
            {t("O'chirish")}
          </button>
        )}
        <span className="sp" />
        <button className="btn" onClick={onClose}>
          {t("Bekor qilish")}
        </button>
        <button className="btn" onClick={() => submit(true)}>
          {t("PDF yuklab olish")}
        </button>
        <button className="btn primary" onClick={() => submit()}>
          {t("Saqlash")}
        </button>
      </div>
    </Modal>
  );
}
