import { useAuth } from "../../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <main className="container py-5">
      <h1 className="h3 mb-4">Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          <i className="bi bi-person-circle" />
        </div>

        <div>
          <h2 className="h4">{user?.name || "User"}</h2>
          <p className="text-muted mb-1">
            {user?.email || "Email not available"}
          </p>
          <p className="mb-0">
            <strong>Role:</strong> {user?.role || "USER"}
          </p>
        </div>
      </div>
    </main>
  );
}
