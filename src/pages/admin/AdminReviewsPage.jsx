import { useState } from "react";

const initialReviews = [
  { id: "rev-1", user: "Yared Abera", target: "Toyota RAV4", rating: 5, comment: "Excellent car, clean and fuel efficient! Highly recommended.", status: "approved" },
  { id: "rev-2", user: "Sintayehu Tesfaye", target: "Gaming PC", rating: 4, comment: "Runs very fast, had minor issues with display cable but owner resolved it.", status: "approved" },
  { id: "rev-3", user: "Helena Assefa", target: "Dewalt Drill Kit", rating: 1, comment: "Spam comment: Check out my website for free tools!", status: "reported", reason: "Spam Link" },
  { id: "rev-4", user: "Mohamed Ibrahim", target: "Canon Camera", rating: 2, comment: "Terrible condition, camera lens had massive scratches.", status: "reported", reason: "Abusive/False details" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState("all");

  const handleAction = (id, newStatus) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleRemove = (id) => {
    if (confirm("Are you sure you want to remove this review permanently?")) {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const filtered = reviews.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Reviews & Ratings</h1>
          <p className="text-muted mb-0">
            Moderate submitted user reviews and resolve flag/report alerts.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex gap-2 mb-4">
          {["all", "approved", "reported"].map(opt => (
            <button
              key={opt}
              type="button"
              className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`}
              onClick={() => setFilter(opt)}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Listing</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={r.status === "reported" ? "table-danger-subtle" : ""}>
                  <td>{r.user}</td>
                  <td className="fw-bold">{r.target}</td>
                  <td>
                    <div className="text-warning">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <i key={i} className="bi bi-star-fill me-1" />
                      ))}
                      {Array.from({ length: 5 - r.rating }).map((_, i) => (
                        <i key={i} className="bi bi-star me-1 text-muted" />
                      ))}
                    </div>
                  </td>
                  <td>
                    <div>{r.comment}</div>
                    {r.status === "reported" && (
                      <div className="text-danger mt-1">
                        <small><strong>Flagged Reason:</strong> {r.reason}</small>
                      </div>
                    )}
                  </td>
                  <td>
                    {r.status === "approved" && (
                      <span className="badge bg-success-subtle text-success">Approved</span>
                    )}
                    {r.status === "reported" && (
                      <span className="badge bg-danger-subtle text-danger">Reported</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {r.status === "reported" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => handleAction(r.id, "approved")}
                        >
                          Approve Review
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemove(r.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No reviews matching criteria.
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
