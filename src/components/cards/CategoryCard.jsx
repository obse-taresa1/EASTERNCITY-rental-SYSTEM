import { Link } from "react-router-dom";

export default function CategoryCard({ to, icon, title, text }) {
  return (
    <Link to={to} className="category-card">
      <i className={`bi ${icon}`}></i>
      <h3>{title}</h3>
      <p>{text}</p>
    </Link>
  );
}
