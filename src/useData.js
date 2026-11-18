import { useState, useEffect, useCallback, useRef } from "react";
import { sb } from "./supabase.js";
import { toRow, fromRow, sortJobs, uid } from "./utils.js";

// Loads jobs and customers, keeps them in sync across devices (realtime + a slow refresh as backup).
export function useData() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState({});
  const [status, setStatus] = useState({ text: "Yuklanmoqda...", err: false });
  const timer = useRef();

  const fetchAll = useCallback(async () => {
    const [a, b] = await Promise.all([
      sb.from("jobs").select("*").order("pos", { ascending: true }),
      sb.from("customers").select("*"),
    ]);
    const error = a.error || b.error;
    if (error) {
      setStatus({ text: "Xato: " + error.message, err: true });
      return;
    }
    setJobs(sortJobs(a.data.map(fromRow)));
    const map = {};
    b.data.forEach((c) => (map[c.name] = { phone: c.phone || "" }));
    setCustomers(map);
    setStatus({ text: "Onlayn", err: false });
  }, []);

  useEffect(() => {
    fetchAll();
    const later = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(fetchAll, 400);
    };
    const channel = sb
      .channel("ish-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, later)
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, later)
      .subscribe();
    const poll = setInterval(() => {
      if (!document.hidden) fetchAll();
    }, 20000);
    const onVisible = () => {
      if (!document.hidden) fetchAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      sb.removeChannel(channel);
      clearInterval(poll);
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchAll]);

  const run = async (promise) => {
    const { error } = await promise;
    if (error) {
      console.error(error);
      setStatus({ text: "Xato: " + error.message, err: true });
      return false;
    }
    setStatus({ text: "Saqlandi", err: false });
    return true;
  };

  // If an optional column (area, rate, mat_ours, mat_price) is not in Supabase yet, save without it instead of losing the job.
  const OPTIONAL = ["area", "rate", "mat_ours", "mat_price"];
  const upsertJobs = async (rows) => {
    let cur = rows;
    for (let i = 0; i <= OPTIONAL.length; i++) {
      const r = await sb.from("jobs").upsert(cur);
      const col = r.error && OPTIONAL.find((c) => (r.error.message || "").includes(c));
      if (!col) return r;
      console.warn(`jobs.${col} ustuni yo'q — supabase-yangilash-area.sql ni ishga tushiring`);
      const strip = (x) => {
        const { [col]: _drop, ...rest } = x;
        return rest;
      };
      cur = Array.isArray(cur) ? cur.map(strip) : strip(cur);
    }
    return { error: { message: "Saqlab bo'lmadi" } };
  };

  const saveJob = (j) => {
    setJobs((list) => {
      const i = list.findIndex((x) => x.id === j.id);
      if (i >= 0) {
        const copy = list.slice();
        copy[i] = j;
        return sortJobs(copy);
      }
      return sortJobs([...list, j]);
    });
    return run(upsertJobs(toRow(j)));
  };

  const removeJob = (id) => {
    setJobs((list) => list.filter((x) => x.id !== id));
    return run(sb.from("jobs").delete().eq("id", id));
  };

  const removeMany = (ids) => {
    setJobs((list) => list.filter((x) => !ids.includes(x.id)));
    return run(sb.from("jobs").delete().in("id", ids));
  };

  const savePhone = (name, phone) => {
    setCustomers((c) => ({ ...c, [name]: { ...(c[name] || {}), phone } }));
    return run(sb.from("customers").upsert({ name, phone }));
  };

  const reorder = (j, dir) => {
    const same = jobs.filter((x) => x.stage === j.stage);
    const i = same.findIndex((x) => x.id === j.id);
    const k = dir < 0 ? i - 1 : i + 1;
    if (k < 0 || k >= same.length) return;
    const o = same[k];
    const pj = j.pos;
    let po = o.pos;
    if (pj === po) po = pj + (dir < 0 ? -1 : 1);
    const a = { ...j, pos: po };
    const b = { ...o, pos: pj };
    setJobs((list) => sortJobs(list.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x))));
    run(upsertJobs([toRow(a), toRow(b)]));
  };

  const restore = async (d) => {
    const base = Date.now();
    const rows = d.jobs.map((j, i) =>
      toRow({
        ...j,
        id: j.id || uid(),
        img: j.img || (d.imgs && d.imgs[j.id]) || null,
        pos: j.pos || base + i,
      })
    );
    setStatus({ text: "Yuklanmoqda...", err: false });
    for (let i = 0; i < rows.length; i += 20) {
      if (!(await run(upsertJobs(rows.slice(i, i + 20))))) return;
    }
    const crows = Object.keys(d.customers || {}).map((n) => ({
      name: n,
      phone: (d.customers[n] || {}).phone || "",
    }));
    if (crows.length) await run(sb.from("customers").upsert(crows));
    await fetchAll();
  };

  const wipe = async () => {
    await run(sb.from("jobs").delete().neq("id", ""));
    await run(sb.from("customers").delete().neq("name", ""));
    await fetchAll();
  };

  return { jobs, customers, status, saveJob, removeJob, removeMany, savePhone, reorder, restore, wipe };
}
