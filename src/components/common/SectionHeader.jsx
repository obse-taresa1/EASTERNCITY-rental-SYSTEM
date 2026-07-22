export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}) {
  return (
    <div className={`section-header text-${align} ${className}`}>
      {eyebrow && <span className="section-label">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
