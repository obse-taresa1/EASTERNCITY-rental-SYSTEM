import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyBookings } from "../../services/bookingApiService.js";
import { getReviewsByListings } from "../../services/reviewApiService.js";
import LeaveReviewModal from "../../components/reviews/LeaveReviewModal.jsx";

function StarDisplay({ rating }) {
  return (
    <div className="rev-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`bi ${n <= rating ? "bi-star-fill" : "bi-star"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [reviewBooking, setReviewBooking] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [reviewsByListing, setReviewsByListing] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!activeUser) {
        setBookings([]);
        setReviewsByListing({});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getMyBookings();
        const renterBookings = data.filter(
          (booking) =>
            String(booking.renterId || booking.userId || "") ===
            String(activeUser.id),
        );
        const completedBookings = renterBookings.filter(
          (booking) => String(booking.status || "").toUpperCase() === "COMPLETED",
        );
        const listingIds = completedBookings.map((booking) => booking.listingId || booking.itemId);
        const listingReviews = await getReviewsByListings(listingIds);

        if (!active) return;
        setBookings(renterBookings);
        setReviewsByListing(listingReviews);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [activeUser, refreshToken]);

  const completedBookings = useMemo(
    () => bookings.filter((b) => String(b.status || "").toUpperCase() === "COMPLETED"),
    [bookings],
  );

  const myReviews = useMemo(() => {
    if (!activeUser) return [];

    return completedBookings.flatMap((booking) => {
      const listingId = booking.listingId || booking.itemId;
      const bookingReviews = reviewsByListing[String(listingId)] || [];

      return bookingReviews
        .filter(
          (review) =>
            String(review.bookingId || "") === String(booking.id) &&
            String(review.reviewerId || review.userId || "") ===
              String(activeUser.id),
        )
        .map((review) => ({
          ...review,
          itemTitle:
            booking.itemTitle || booking.listing?.title || review.itemTitle || "Rental Item",
          itemId: listingId,
        }));
    });
  }, [activeUser, completedBookings, reviewsByListing]);

  const pendingReviews = completedBookings.filter((booking) => {
    const listingId = booking.listingId || booking.itemId;
    const bookingReviews = reviewsByListing[String(listingId)] || [];

    return !bookingReviews.some(
      (review) =>
        String(review.bookingId || "") === String(booking.id) &&
        String(review.reviewerId || review.userId || "") ===
          String(activeUser?.id || ""),
    );
  });

  if (loading) {
    return <div className="ud-page">Loading reviews...</div>;
  }

  return (
    <div className="ud-page" key={refreshToken}>
      <div className="ud-page-header">
        <div>
          <span className="ud-label">FEEDBACK</span>
          <h1 className="ud-page-title">Reviews & Ratings</h1>
          <p className="ud-page-sub">Share your rental experience and view past reviews.</p>
        </div>
        <div className="ud-summary-chips">
          <div className="ud-chip ud-chip-orange">
            <i className="bi bi-star-fill" />
            <div>
              <strong>{myReviews.length}</strong>
              <span>Reviews Left</span>
            </div>
          </div>
          <div className="ud-chip ud-chip-yellow">
            <i className="bi bi-pencil" />
            <div>
              <strong>{pendingReviews.length}</strong>
              <span>Awaiting Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <section className="ud-section">
          <h2 className="ud-section-title">
            <i className="bi bi-pencil-square text-warning" /> Leave a Review
            <span className="ud-count-badge">{pendingReviews.length}</span>
          </h2>
          <div className="rev-pending-list">
            {pendingReviews.map((booking) => (
              <div className="ud-glass-card rev-pending-card" key={booking.id}>
                <div className="rev-pending-info">
                  <i className="bi bi-flag-fill text-success" />
                  <div>
                    <strong>{booking.itemTitle}</strong>
                    <span>
                      {booking.startDate} → {booking.endDate}
                    </span>
                    <span className="text-muted small">Owner: {booking.owner}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="ud-btn-red"
                  onClick={() => setReviewBooking(booking)}
                >
                  <i className="bi bi-star-fill" /> Leave Review
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review History */}
      <section className="ud-section">
        <h2 className="ud-section-title">
          <i className="bi bi-star-fill text-warning" /> My Review History
          <span className="ud-count-badge">{myReviews.length}</span>
        </h2>
        {myReviews.length === 0 ? (
          <div className="ud-empty-state">
            <i className="bi bi-star" />
            <p>You haven't submitted any reviews yet.</p>
            <p className="text-muted small">
              Reviews appear after you complete a rental booking.
            </p>
            <Link to="/my-bookings" className="ud-btn-outline">
              View Bookings
            </Link>
          </div>
        ) : (
          <div className="rev-history-list">
            {myReviews.map((review) => (
              <div className="ud-glass-card rev-history-card" key={review.id}>
                <div className="rev-history-header">
                  <div>
                    <strong className="rev-item-title">{review.itemTitle || "Rental Item"}</strong>
                    <StarDisplay rating={review.rating} />
                  </div>
                  <span className="rev-date">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="rev-comment">
                    <i className="bi bi-chat-quote" /> {review.comment}
                  </p>
                )}
                <Link
                  to={`/items/${review.itemId}`}
                  className="ud-btn-outline ud-btn-sm"
                >
                  View Item
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {reviewBooking && (
        <LeaveReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onReviewSubmitted={() => {
            setReviewBooking(null);
            setRefreshToken((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}
