import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminTopbar({ title }) {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="mb-0 text-muted">{title}</p>
        <h2 className="h5 mb-0">{activeUser?.name || "Administrator"}</h2>
      </div>

      <div className="dashboard-user-pill">
        <i className="bi bi-shield-lock" />
        <span>{activeUser?.role || "admin"}</span>
      </div>
    </header>
  );
}
