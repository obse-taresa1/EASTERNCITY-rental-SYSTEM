import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  createAdminUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/userApiService.js";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "ADMIN",
    password: "",
  });
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAdmins() {
      setIsLoading(true);
      try {
        const users = await getUsers();
        if (!active) return;
        setAdmins(
          users
            .filter((user) =>
              ["ADMIN", "SUPER_ADMIN"].includes(
                String(user.role || "").toUpperCase(),
              ),
            )
            .map((user) => ({ ...user, status: user.status || "active" })),
        );
      } catch (error) {
        if (!active) return;
        setNotice(error.message || "Unable to load administrators.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadAdmins();

    const handleUpdate = () => loadAdmins();
    window.addEventListener("easterncity:users-updated", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("easterncity:users-updated", handleUpdate);
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;

    try {
      await createAdminUser(newAdmin);
      setNewAdmin({ name: "", email: "", role: "ADMIN", password: "" });
      setIsAdding(false);
      setNotice("Admin account created successfully.");
    } catch (error) {
      setNotice(error.message || "Unable to create admin account.");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUser(editingAdmin.id, {
        name: editingAdmin.name,
        email: editingAdmin.email,
      });
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === updated.id ? { ...admin, ...updated } : admin,
        ),
      );
      setEditingAdmin(null);
      setNotice("Admin account updated successfully.");
    } catch (error) {
      setNotice(error.message || "Unable to update admin account.");
    }
  };

  const handleToggleStatus = async (admin) => {
    const nextStatus = admin.status === "active" ? "SUSPENDED" : "ACTIVE";

    try {
      const updated = await updateUser(admin.id, { status: nextStatus });
      setAdmins((prev) =>
        prev.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );
      setNotice(
        nextStatus === "ACTIVE"
          ? "Admin account activated."
          : "Admin account suspended.",
      );
    } catch (error) {
      setNotice(error.message || "Unable to update admin status.");
    }
  };

  const handleRemove = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this administrator account?",
      )
    ) {
      try {
        await deleteUser(id);
        setAdmins((prev) => prev.filter((admin) => admin.id !== id));
        setNotice("Admin account removed.");
      } catch (error) {
        setNotice(error.message || "Unable to remove admin account.");
      }
    }
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Admin Management</h1>
          <p className="text-muted mb-0">
            Create, monitor, or manage permission levels of administrative
            staff.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent-custom"
          onClick={() => setIsAdding(true)}
        >
          <i className="bi bi-plus-circle me-1" /> Add Admin
        </button>
      </div>

      {notice && <div className="alert alert-info">{notice}</div>}

      <div className="admin-table-container">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
          </div>
        ) : (
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
                {admins.map((a) => (
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
                          onClick={() => handleToggleStatus(a)}
                        >
                          {a.status === "active" ? "Suspend" : "Activate"}
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
        )}
      </div>

      {isAdding && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ background: "var(--card-bg)" }}
            >
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
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, email: e.target.value })
                      }
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
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, password: e.target.value })
                      }
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role Designation</label>
                    <select
                      className="form-select"
                      value={newAdmin.role}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, role: e.target.value })
                      }
                    >
                      <option value="ADMIN">Admin</option>
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
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ background: "var(--card-bg)" }}
            >
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
                      onChange={(e) =>
                        setEditingAdmin({
                          ...editingAdmin,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editingAdmin.email}
                      onChange={(e) =>
                        setEditingAdmin({
                          ...editingAdmin,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role Designation</label>
                    <select
                      className="form-select"
                      value={editingAdmin.role}
                      onChange={(e) =>
                        setEditingAdmin({
                          ...editingAdmin,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="ADMIN">Admin</option>
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
