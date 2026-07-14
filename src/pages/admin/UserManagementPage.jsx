import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { deleteUser, getUsers, updateUser } from "../../services/userApiService.js";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

export default function UserManagementPage() {
  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setNotice("");
      try {
        const users = await getUsers();
        if (active) setUsersList(users);
      } catch (error) {
        if (active) setNotice(error.message || "Unable to load users.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setNotice("");
    try {
      const updated = await updateUser(id, { status: newStatus.toUpperCase() });
      setUsersList(prev =>
        prev.map(u => (u.id === id ? { ...u, ...updated } : u))
      );
    } catch (error) {
      setNotice(error.message || "Unable to update user status.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setNotice("");
      try {
        await deleteUser(id);
        setUsersList(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        setNotice(error.message || "Unable to delete user.");
      }
    }
  };

  const filtered = usersList.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      String(u.city || "").toLowerCase().includes(search.toLowerCase());
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
        {notice && <div className="alert alert-warning">{notice}</div>}
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
                  <td>{u.city || "-"}</td>
                  <td>{formatDate(u.createdAt || u.date)}</td>
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
                    {loading ? "Loading users..." : "No users found matching criteria."}
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
