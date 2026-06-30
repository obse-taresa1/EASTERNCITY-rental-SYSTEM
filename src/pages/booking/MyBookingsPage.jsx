import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getBookingsByUser,
  hasReviewForBooking,
} from "../../services/bookingService.js";
import LeaveReviewModal from "../../components/reviews/LeaveReviewModal.jsx";

const STATUS_LABELS = {
  PENDING: {
    label: "Pending",
    class: "badge-pending",
    icon: "bi-hourglass-split",
  },
  ACCEPTED: {
    label: "Accepted",
    class: "badge-confirmed",
    icon: "bi-check-circle-fill",
  },
  ACTIVE: {
    label: "Active Rental",
    class: "badge-active-rental",
    icon: "bi-play-circle-fill",
  },
  COMPLETED: {
    label: "Finished",
    class: "badge-completed",
    icon: "bi-flag-fill",
  },
  CANCELLED: {
    label: "Cancelled",
    class: "badge-cancelled",
    icon: "bi-x-circle-fill",
  },
};

export default function MyBookingsPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const location = useLocation();
  const [, setRefreshToken] = useState(0);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || "",
  );
  const bookings = activeUser ? getBookingsByUser(activeUser.id) : [];

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case "pending":
        return bookings.filter((b) => b.status === "PENDING");
      case "accepted":
        return bookings.filter((b) => b.status === "ACCEPTED");
      case "active":
        return bookings.filter((b) => b.status === "ACTIVE");
      case "finished":
        return bookings.filter((b) => b.status === "COMPLETED");
      default:
        return bookings;
    }
  };

  const filtered = getFilteredBookings();

  return (
    <main className="dashboard-content my-bookings-page pb-5">
      {successMessage && (
        <div className="alert alert-success d-flex align-items-center mb-4 border-0 shadow-sm animate__animated animate__fadeInDown rounded-4">
          <i className="bi bi-check-circle-fill fs-4 me-3 text-success"></i>
          <strong className="text-dark">{successMessage}</strong>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span
            className="text-danger fw-bold"
            style={{
              letterSpacing: "1px",
              fontSize: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            Rentals
          </span>
          <h1 className="fw-bold m-0" style={{ fontSize: "2.5rem" }}>
            My Bookings
          </h1>
        </div>
        <Link
          to="/items"
          className="btn btn-danger rounded-pill fw-bold px-4 py-2 shadow-sm"
        >
          <i className="bi bi-search me-2" /> Browse Items
        </Link>
      </div>

      <div className="d-flex gap-2 mb-4 overflow-auto pb-2 border-bottom details-tab-system">
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "pending" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "accepted" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted Bookings
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "active" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("active")}
        >
          Active Rentals
        </button>
        <button
          className={`btn rounded-pill fw-bold px-4 ${activeTab === "finished" ? "btn-danger" : "btn-outline-secondary bg-white"}`}
          onClick={() => setActiveTab("finished")}
        >
          Finished Rentals
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
          <div className="mb-3">
            <i
              className="bi bi-calendar-x text-danger opacity-50"
              style={{ fontSize: "4rem" }}
            ></i>
          </div>
          <h3 className="fw-bold">No bookings found</h3>
          <p className="text-muted">
            You don't have any bookings in this category.
          </p>
          <Link
            to="/items"
            className="btn btn-outline-danger rounded-pill fw-bold mt-3 px-4"
          >
            Find something to rent
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((booking) => {
            const statusInfo =
              STATUS_LABELS[booking.status] || STATUS_LABELS.PENDING;
            const isCompleted = booking.status === "completed";
            const alreadyReviewed = hasReviewForBooking(booking.id);

            return (
              <div className="col-12" key={booking.id}>
                <div className="premium-glass-card bg-white p-4 h-100 d-flex flex-column flex-md-row gap-4 align-items-center">
                  <div
                    className="booking-card-icon-area text-center"
                    style={{ minWidth: "120px" }}
                  >
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i
                        className={`bi ${statusInfo.icon} text-danger`}
                        style={{ fontSize: "2.5rem" }}
                      ></i>
                    </div>
                    <span
                      className={`badge bg-${isCompleted ? "success" : "warning"} text-dark border w-100`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex-grow-1 w-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h4 className="fw-bold m-0">{booking.itemTitle}</h4>
                        <p className="text-muted small m-0">
                          Booking ID: #{booking.id.slice(-8)}
                        </p>
                      </div>
                      <h4 className="text-danger fw-bold m-0">
                        ETB{" "}
                        {booking.totalPrice?.toLocaleString() ||
                          booking.totalAmount?.toLocaleString()}
                      </h4>
                    </div>

                    <div
                      className="row g-3 text-muted mt-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <div className="col-sm-6 col-md-3">
                        <i className="bi bi-calendar3 me-2"></i>
                        <strong>Dates:</strong>
                        <br />
                        {booking.startDate} to {booking.endDate}
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <i className="bi bi-person me-2"></i>
                        <strong>Owner:</strong>
                        <br />
                        {booking.owner}
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Payment:</strong>
                        <br />
                        Direct with owner
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <i className="bi bi-geo-alt me-2"></i>
                        <strong>City:</strong>
                        <br />
                        {booking.location || "Eastern Region"}
                      </div>
                    </div>
                  </div>

                  <div
                    className="d-flex flex-column gap-2"
                    style={{ minWidth: "180px" }}
                  >
                    <Link
                      to={`/items/${booking.itemId}`}
                      className="btn btn-outline-secondary w-100 rounded-pill fw-bold"
                    >
                      View Item
                    </Link>

                    {isCompleted &&
                      (alreadyReviewed ? (
                        <span className="btn btn-light w-100 rounded-pill fw-bold text-success border">
                          <i className="bi bi-check-circle-fill"></i> Reviewed
                        </span>
                      ) : (
                        <button
                          className="btn btn-warning w-100 rounded-pill fw-bold"
                          onClick={() => setReviewBooking(booking)}
                          type="button"
                        >
                          <i className="bi bi-star-fill"></i> Leave Review
                        </button>
                      ))}
                  </div>
                </div>
                <div className="alert alert-info mt-3 mb-0">
                  <strong>Payment Information</strong>
                  <p className="mb-0">
                    This platform does not process rental payments. Payment arrangements are made directly with the listing owner.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewBooking && (
        <LeaveReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onReviewSubmitted={() => setRefreshToken((current) => current + 1)}
        />
      )}
    </main>
  );
}

