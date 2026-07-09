export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  placeholder = "Select option",
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

      <select
        id={name}
        name={name}
        className={`form-select ${error ? "is-invalid" : ""}`.trim()}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
