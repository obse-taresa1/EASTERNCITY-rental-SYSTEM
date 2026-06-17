export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "",
  className = "",
  ...props
}) {
  const variantClass =
    variant === "outline"
      ? "btn btn-outline-custom"
      : variant === "secondary"
        ? "btn btn-outline-secondary"
        : "btn btn-primary-custom";

  const sizeClass = size ? `btn-${size}` : "";

  return (
    <button
      type={type}
      className={`${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
