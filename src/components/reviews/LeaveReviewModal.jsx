import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { submitReview } from "../../services/reviewApiService.js";

export default function LeaveReviewModal({
  booking,
  onClose,
  onReviewSubmitted,
}) {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitReview({
        reviewerId: activeUser.id,
        userName: activeUser.name,
        listingId: booking.listingId || booking.itemId,
        itemTitle: booking.itemTitle,
        bookingId: booking.id,
        rating,
        comment,
      });
      onReviewSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Leave a Review</h3>
          <button
            className="review-modal-close"
            onClick={onClose}
            type="button"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="review-item-info">
          <i className="bi bi-box-seam"></i>
          <span>{booking.itemTitle}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="review-stars">
            <p>Your Rating</p>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`star-btn ${s <= (hoverRating || rating) ? "active" : ""}`}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                >
                  <i
                    className={`bi bi-star${s <= (hoverRating || rating) ? "-fill" : ""}`}
                  ></i>
                </button>
              ))}
              {rating > 0 && (
                <span className="rating-label">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          <div className="review-comment">
            <label htmlFor="review-comment">Comment (optional)</label>
            <textarea
              id="review-comment"
              rows={4}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && <p className="review-error">{error}</p>}

          <div className="review-modal-actions">
            <button
              type="button"
              className="btn-review-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-review-submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
