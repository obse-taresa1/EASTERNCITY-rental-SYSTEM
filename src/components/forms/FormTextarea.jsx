export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
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

      <textarea
        id={name}
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`.trim()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        {...props}
      />

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
