import { useEffect, useState } from "react";
import { sb } from "./supabase.js";

// Who is online right now (Supabase Realtime presence). Returns a sorted list of names.
export function usePresence(username) {
  const [online, setOnline] = useState([username]);
  useEffect(() => {
    if (!username || !sb.channel) return;
    let ch;
    try {
      ch = sb.channel("online-users", { config: { presence: { key: username + "-" + Math.random().toString(36).slice(2, 7) } } });
      const sync = () => {
        const st = ch.presenceState();
        const names = new Set();
        Object.values(st).forEach((arr) => arr.forEach((p) => p && p.name && names.add(p.name)));
        setOnline([...names].sort());
      };
      ch.on("presence", { event: "sync" }, sync).subscribe((s) => {
        if (s === "SUBSCRIBED") ch.track({ name: username });
      });
    } catch {
      /* presence is optional */
    }
    return () => {
      try {
        if (ch) sb.removeChannel(ch);
      } catch {
        /* ignore */
      }
    };
  }, [username]);
  return online;
}
