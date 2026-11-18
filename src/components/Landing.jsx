import { useEffect } from "react";

// The public Revo website (public/sayt.html), shown to anyone who is not signed in.
// Its "Kirish" button tells this app to open the login page.
export default function Landing({ onLogin }) {
  useEffect(() => {
    const on = (e) => {
      if (e.data === "revo-login") onLogin();
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [onLogin]);

  const doc = window.__SAYT_DOC__; // set only by the in-chat preview
  const props = doc ? { srcDoc: doc } : { src: `${import.meta.env.BASE_URL}sayt.html` };
  return <iframe className="landing" title="Revo" {...props} />;
}
