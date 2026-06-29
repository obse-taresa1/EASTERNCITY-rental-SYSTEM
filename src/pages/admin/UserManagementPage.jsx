import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const initialUsers = [
  { id: "u-1", name: "Almaz Belay", email: "almaz@example.com", city: "Jigjiga", date: "2026-05-12", status: "active" },
  { id: "u-2", name: "Yonas Kassa", email: "yonas@example.com", city: "Dire Dawa", date: "2026-05-18", status: "suspended" },
  { id: "u-3", name: "Fatuma Mohammed", email: "fatuma@example.com", city: "Harar", date: "2026-06-01", status: "active" },
  { id: "u-4", name: "Kebede Alemu", email: "kebede@example.com", city: "Jigjiga", date: "2026-06-10", status: "active" },
  { id: "u-5", name: "Selamawit Girma", email: "selam@example.com", city: "Dire Dawa", date: "2026-06-15", status: "suspended" },
];

export default function UserManagementPage() {
  const [usersList, setUsersList] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const handleStatusChange = (id, newStatus) => {
    setUsersList(prev =>
      prev.map(u => (u.id === id ? { ...u, status: newStatus } : u))
    );
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsersList(prev => prev.filter(u => u.id !== id));
    }
  };

  const filtered = usersList.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Users Management</h1>
          <p className="text-muted mb-0">Manage registered renters, owners, and user states.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2">
            {["all", "active", "suspended"].map(status => (
              <button
                key={status}
                type="button"
                className={`btn btn-sm ${filter === status ? "btn-accent-custom" : "btn-outline-secondary"}`}
                onClick={() => setFilter(status)}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="search-box" style={{ maxWidth: "300px", width: "100%" }}>
            <input
              type="text"
              placeholder="Search by name, email, city..."
              className="form-control"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="fw-bold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.city}</td>
                  <td>{u.date}</td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {u.status === "suspended" ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusChange(u.id, "active")}
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-warning text-white"
                          onClick={() => handleStatusChange(u.id, "suspended")}
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No users found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
