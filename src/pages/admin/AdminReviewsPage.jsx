import { useEffect, useState } from "react";
import { getAllReviews } from "../../services/reviewApiService.js";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    getAllReviews().then((data) => {
      if (active) setReviews(data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "high") return review.rating >= 4;
    if (filter === "low") return review.rating <= 2;
    return true;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Reviews & Ratings</h1>
          <p className="text-muted mb-0">
            Monitor submitted user reviews from the database.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex gap-2 mb-4">
          {["all", "high", "low"].map((opt) => (
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id}>
                  <td>{review.userName}</td>
                  <td className="fw-bold">
                    {review.listing?.title || review.itemId || "-"}
                  </td>
                  <td>
                    <div className="text-warning">
                      {Array.from({ length: Math.min(5, review.rating) }).map(
                        (_, i) => (
                          <i key={i} className="bi bi-star-fill me-1" />
                        ),
                      )}
                      {Array.from({
                        length: Math.max(0, 5 - review.rating),
                      }).map((_, i) => (
                        <i key={i} className="bi bi-star me-1 text-muted" />
                      ))}
                    </div>
                  </td>
                  <td>{review.comment || "-"}</td>
                  <td>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
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
