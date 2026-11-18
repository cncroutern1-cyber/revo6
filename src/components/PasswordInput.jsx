import { useState } from "react";
import Icon from "./Icons.jsx";

// Password field with an eye button to show or hide what is typed.
export default function PasswordInput({ id, value, onChange, placeholder, autoComplete, autoFocus, ariaLabel }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pwfield">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="eye"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Parolni yashirish" : "Parolni ko'rsatish"}
        title={show ? "Parolni yashirish" : "Parolni ko'rsatish"}
        aria-pressed={show}
      >
        <Icon name={show ? "eyeOff" : "eye"} size={18} />
      </button>
    </div>
  );
}
