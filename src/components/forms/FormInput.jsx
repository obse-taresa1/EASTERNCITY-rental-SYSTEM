export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = "",
  ...props
}) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        className={`form-control ${error ? "is-invalid" : ""}`.trim()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
