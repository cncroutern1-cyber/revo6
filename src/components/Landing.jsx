import { useEffect } from "react";

// The public Revo website (public/sayt.html), shown to anyone who is not signed in.
// There is no visible login button: the page asks this app to open the login (Ctrl+7 or 5 taps on the logo).
export default function Landing({ onLogin }) {
  useEffect(() => {
    const on = (e) => {
      if (e.data === "revo-login") onLogin();
    };
    // Ctrl+7 (or Cmd+7) opens the login page. Tapping the REVO logo 5 times does the same on a phone.
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "7" || e.code === "Digit7")) {
        e.preventDefault();
        onLogin();
      }
    };
    window.addEventListener("message", on);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("message", on);
      window.removeEventListener("keydown", key);
    };
  }, [onLogin]);

  const doc = window.__SAYT_DOC__; // set only by the in-chat preview
  const props = doc ? { srcDoc: doc } : { src: `${import.meta.env.BASE_URL}sayt.html` };
  return <iframe className="landing" title="Revo" {...props} />;
}
