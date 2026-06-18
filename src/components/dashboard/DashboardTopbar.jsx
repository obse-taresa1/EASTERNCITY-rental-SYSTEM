import { useAuth } from "../../context/AuthContext.jsx";

export default function DashboardTopbar() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="mb-0 text-muted">Welcome back</p>
        <h2 className="h5 mb-0">{activeUser?.name || "User"}</h2>
      </div>

      <div className="dashboard-user-pill">
        <i className="bi bi-person-circle" />
        <span>{activeUser?.role || "account"}</span>
      </div>
    </header>
  );
}
