import { useState } from "react";

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  minLength,
  required = false,
  autoComplete,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="premium-input-wrapper">
      <i className="bi bi-lock leading-icon"></i>
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        className="premium-input has-icon"
        value={value}
        onChange={onChange}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
        placeholder="Enter your password"
      />
      <button
        type="button"
        className="premium-password-toggle"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        <i className={`bi ${isVisible ? "bi-eye-slash" : "bi-eye"}`} />
      </button>
    </div>
  );
}
