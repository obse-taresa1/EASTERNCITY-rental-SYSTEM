import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../services/categoryApiService.js";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setLoading(true);
      setNotice("");
      try {
        const data = await fetchCategories();
        if (active) setCategories(data);
      } catch (error) {
        if (active) setNotice(error.message || "Unable to load categories.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;

    setNotice("");
    try {
      const newCat = await createCategory({
      name: newCatName,
      slug: newCatSlug,
      });

      setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName("");
      setNewCatSlug("");
      setIsAdding(false);
    } catch (error) {
      setNotice(error.message || "Unable to add category.");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setNotice("");
    try {
      const updated = await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || "",
      });
      setCategories(prev =>
        prev.map(c => (c.id === editingCategory.id ? { ...c, ...updated } : c))
      );
      setEditingCategory(null);
    } catch (error) {
      setNotice(error.message || "Unable to update category.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category? All listings in this category might be affected.")) {
      setNotice("");
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        setNotice(error.message || "Unable to delete category.");
      }
    }
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Categories Management</h1>
          <p className="text-muted mb-0">Create new item categories or modify existing listings groups.</p>
        </div>
        <button
          type="button"
          className="btn btn-accent-custom"
          onClick={() => setIsAdding(true)}
        >
          <i className="bi bi-plus-circle me-1" /> Add Category
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="admin-table-container">
            {notice && <div className="alert alert-warning">{notice}</div>}
            <h2 className="h5 mb-3">Category Statistics</h2>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>URL Slug</th>
                    <th>Total Listings</th>
                    <th>Active Rentals</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.name}</td>
                      <td><code>{c.slug}</code></td>
                      <td>{c.listingsCount} Listings</td>
                      <td>{c.activeRentals} Rentals</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            onClick={() => setEditingCategory(c)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        {loading ? "Loading categories..." : "No categories found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <form onSubmit={handleAdd}>
                <div className="modal-header border-0">
                  <h5 className="modal-title">Add New Category</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsAdding(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCatName}
                      onChange={e => {
                        setNewCatName(e.target.value);
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }}
                      placeholder="e.g. Health & Fitness"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">URL Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCatSlug}
                      onChange={e => setNewCatSlug(e.target.value)}
                      placeholder="e.g. health-fitness"
                      required
                    />
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
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header border-0">
                  <h5 className="modal-title">Edit Category</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingCategory(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingCategory.name}
                      onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">URL Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingCategory.slug}
                      onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingCategory(null)}
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
