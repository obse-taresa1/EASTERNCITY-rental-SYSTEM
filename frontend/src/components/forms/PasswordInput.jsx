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
    <div className="input-group">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        className="form-control"
        value={value}
        onChange={onChange}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        <i className={`bi ${isVisible ? "bi-eye-slash" : "bi-eye"}`} />
      </button>
    </div>
  );
}
