import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

export default function UserManagementPage() {
  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadUsers() {
    setUsersList(await adminApi.users({ search, status: filter }));
  }

  useEffect(() => { loadUsers().catch(console.error); }, [search, filter]);

  const handleStatusChange = async (id, newStatus) => {
    await adminApi.updateUser(id, { status: newStatus.toUpperCase() });
    await loadUsers();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await adminApi.deleteUser(id);
      await loadUsers();
    }
  };

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
              <button key={status} type="button" className={`btn btn-sm ${filter === status ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setFilter(status)}>{status.toUpperCase()}</button>
            ))}
          </div>
          <div className="search-box" style={{ maxWidth: "300px", width: "100%" }}>
            <input type="text" placeholder="Search by name, email, city..." className="form-control" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Name</th><th>Email</th><th>City</th><th>Registration Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {usersList.map(u => {
                const status = String(u.status || "ACTIVE").toLowerCase();
                return (
                  <tr key={u.id}>
                    <td className="fw-bold">{u.name}</td><td>{u.email}</td><td>{u.city || "-"}</td><td>{formatDate(u.createdAt)}</td><td><StatusBadge status={status} /></td>
                    <td><div className="d-flex gap-2">
                      {status === "suspended" ? <button type="button" className="btn btn-sm btn-success" onClick={() => handleStatusChange(u.id, "active")}>Activate</button> : <button type="button" className="btn btn-sm btn-warning text-white" onClick={() => handleStatusChange(u.id, "suspended")}>Suspend</button>}
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                    </div></td>
                  </tr>
                );
              })}
              {usersList.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No users found matching criteria.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
