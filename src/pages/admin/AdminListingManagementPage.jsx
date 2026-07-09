import { useState, useEffect } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  approveListing,
  deleteListing,
  getManageListings,
  rejectListing,
  updateListing,
} from "../../services/listingApiService.js";

export default function AdminListingManagementPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [viewScreenshot, setViewScreenshot] = useState(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await getManageListings();
      console.log("Admin listings:", response?.data);

      const listingsData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.listings)
          ? response.data.listings
          : Array.isArray(response)
            ? response
            : [];

      setListings(listingsData);
    } catch (error) {
      console.error("Failed to load listings:", error);
      setNotice(error.message || "Unable to load listings.");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    window.addEventListener("easterncity:listings-updated", loadListings);
    return () =>
      window.removeEventListener("easterncity:listings-updated", loadListings);
  }, []);

  const handleStatusChange = async (id, newStatus, reason = "") => {
    try {
      if (newStatus === "APPROVED") {
        await approveListing(id);
      } else {
        await rejectListing(id, reason);
      }
      setNotice(`Listing ${String(newStatus).toLowerCase()} successfully.`);
    } catch (error) {
      setNotice(error.message || "Unable to update listing status.");
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this listing?")) {
      try {
        await deleteListing(id);
        setNotice("Listing removed successfully.");
      } catch (error) {
        setNotice(error.message || "Unable to remove listing.");
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateListing(editingItem.id, {
        title: editingItem.title,
        categoryId: editingItem.categoryId || editingItem.category,
        city: editingItem.city,
        location: editingItem.location,
        description: editingItem.description,
      });
      setEditingItem(null);
      setNotice("Listing updated successfully.");
    } catch (error) {
      setNotice(error.message || "Unable to update listing.");
    }
  };

  const filtered = Array.isArray(listings)
    ? listings.filter((item) => {
        const matchesSearch =
          (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.owner?.name || item.ownerName || item.owner?.email || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (item.city || "").toLowerCase().includes(search.toLowerCase());

        const itemStatus = String(item.status || "PENDING").toLowerCase();
        const normalizedFilter = filter.toLowerCase();
        const matchesFilter =
          filter === "all" || itemStatus === normalizedFilter;

        return matchesSearch && matchesFilter;
      })
    : [];

  if (isLoading) {
    return <div>Loading listings...</div>;
  }

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Listings Management</h1>
          <p className="text-muted mb-0">
            Approve new listings, reject invalid entries, or edit listing info.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2">
            {["all", "pending", "approved", "rejected"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`}
                onClick={() => setFilter(opt)}
              >
                {opt.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <div
            className="search-box"
            style={{ maxWidth: "300px", width: "100%" }}
          >
            <input
              type="text"
              placeholder="Search listings..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>City</th>
                <th>Owner</th>
                <th>Submitted</th>
                <th>Screenshot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.title}</td>
                  <td>{item.category?.name || item.categoryName || "-"}</td>
                  <td>{item.city}</td>
                  <td>
                    {item.owner?.name ||
                      item.ownerName ||
                      item.owner?.email ||
                      "Unknown"}
                  </td>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {item.paymentProofUrl || null ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          setViewScreenshot(item.paymentProofUrl || null)
                        }
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-muted small">None</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={item.status || "PENDING"} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {String(item.status || "PENDING").toUpperCase() ===
                        "PENDING" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              handleStatusChange(item.id, "APPROVED")
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason)
                                handleStatusChange(item.id, "REJECTED", reason);
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {String(item.status || "").toUpperCase() ===
                        "REJECTED" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleStatusChange(item.id, "APPROVED")
                          }
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setEditingItem(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No listings found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewScreenshot && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ background: "var(--card-bg)" }}
            >
              <div className="modal-header border-0">
                <h5 className="modal-title">Payment Screenshot</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewScreenshot(null)}
                />
              </div>
              <div className="modal-body text-center">
                <img
                  src={viewScreenshot}
                  alt="Payment Screenshot"
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
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
                  <h5 className="modal-title">Edit Listing Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingItem(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Item Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingItem?.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        editingItem?.category?.name ||
                        editingItem?.categoryName ||
                        ""
                      }
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          category: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem?.city || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Sefar</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem?.sefar || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            sefar: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingItem(null)}
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
