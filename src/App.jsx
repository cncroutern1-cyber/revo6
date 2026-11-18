import { useEffect, useState } from "react";
import { sb } from "./supabase.js";
import Login from "./components/Login.jsx";
import Tracker from "./components/Tracker.jsx";
import { LangProvider, useT } from "./i18n.jsx";
import Landing from "./components/Landing.jsx";

function Inner() {
  const t = useT();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [me, setMe] = useState(null); // { username, role }
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email || "");
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || "");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Who is signed in, and are they an admin? Read from the "profiles" table.
  useEffect(() => {
    if (!email) {
      setMe(null);
      return;
    }
    let off = false;
    sb.from("profiles")
      .select("username,role")
      .eq("email", email)
      .maybeSingle()
      .then(({ data }) => {
        if (off) return;
        setMe(
          data || {
            username: email.split("@")[0],
            role: email.startsWith("abdulloh@") ? "admin" : "worker",
          }
        );
      });
    return () => {
      off = true;
    };
  }, [email]);

  if (!ready) return <div className="boot">{t("Yuklanmoqda...")}</div>;
  if (!email) {
    // Visitors see the public Revo website; "Kirish" opens the login page.
    if (hash !== "#kirish") return <Landing onLogin={() => (window.location.hash = "kirish")} />;
    return <Login />;
  }
  if (!me) return <div className="boot">{t("Yuklanmoqda...")}</div>;
  return <Tracker isAdmin={me.role === "admin"} username={me.username} />;
}

export default function App() {
  return (
    <LangProvider>
      <Inner />
    </LangProvider>
  );
}
