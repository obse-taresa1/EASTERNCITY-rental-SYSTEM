import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { getUsers, saveUsers } from "../../services/authService.js";

const initialAdmins = [
  { id: "adm-1", name: "Kidus Daniel", email: "kidus@cityrent.com", role: "admin", status: "active" },
  { id: "adm-2", name: "Betty Teshome", email: "betty@cityrent.com", role: "supervisor", status: "active" },
  { id: "adm-3", name: "Tewodros Assefa", email: "teddy@cityrent.com", role: "admin", status: "deactivated" },
];

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "admin", password: "" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;

    const created = {
      id: `adm-${Date.now()}`,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      password: newAdmin.password,
      status: "active",
    };

    // Update admins state
    setAdmins(prev => [...prev, created]);
    // Persist the new admin to user storage for login
    const existingUsers = getUsers();
    const newUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      password: created.password,
      role: created.role,
    };
    saveUsers([newUser, ...existingUsers]);

    setNewAdmin({ name: "", email: "", role: "admin", password: "" });
    setIsAdding(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setAdmins(prev =>
      prev.map(a => (a.id === editingAdmin.id ? editingAdmin : a))
    );
    setEditingAdmin(null);
  };

  const handleToggleStatus = (id) => {
    setAdmins(prev =>
      prev.map(a => {
        if (a.id === id) {
          const newStatus = a.status === "active" ? "deactivated" : "active";
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  const handleRemove = (id) => {
    if (confirm("Are you sure you want to remove this administrator account?")) {
      setAdmins(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Admin Management</h1>
          <p className="text-muted mb-0">Create, monitor, or manage permission levels of administrative staff.</p>
        </div>
        <button
          type="button"
          className="btn btn-accent-custom"
          onClick={() => setIsAdding(true)}
        >
          <i className="bi bi-plus-circle me-1" /> Add Admin
        </button>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td className="fw-bold">{a.name}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className="badge bg-secondary-subtle text-dark">
                      {a.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${a.status === "active" ? "btn-warning text-white" : "btn-success"}`}
                        onClick={() => handleToggleStatus(a.id)}
                      >
                        {a.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setEditingAdmin(a)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemove(a.id)}
                      >
                        Remove
                      </button>
                    </div>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <form onSubmit={handleAdd}>
                <div className="modal-header border-0">
                  <h5 className="modal-title">Add Administrative Account</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsAdding(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAdmin.name}
                      onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      placeholder="e.g. Kidus Daniel"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newAdmin.email}
                      onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      placeholder="e.g. kidus@cityrent.com"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newAdmin.password}
                      onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role Designation</label>
                    <select
                      className="form-select"
                      value={newAdmin.role}
                      onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent-custom">
                    Add Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editingAdmin && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header border-0">
                  <h5 className="modal-title">Edit Administrative Account</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingAdmin(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingAdmin.name}
                      onChange={e => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editingAdmin.email}
                      onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role Designation</label>
                    <select
                      className="form-select"
                      value={editingAdmin.role}
                      onChange={e => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingAdmin(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent-custom">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
