export default function Card({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component className={`card card-custom ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
