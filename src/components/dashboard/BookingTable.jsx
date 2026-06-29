import StatusBadge from "../common/StatusBadge.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { updateBookingStatus } from "../../services/bookingService.js";
import { useState, useEffect } from "react";

export default function BookingTable({ bookings }) {
  const [rows, setRows] = useState(bookings);
  useEffect(() => { setRows(bookings); }, [bookings]);

  function handleStatusChange(id, status) {
    const updated = updateBookingStatus(id, status);
    setRows((current) =>
      current.map((booking) => (booking.id === id ? updated : booking)),
    );
    // Notify other components that bookings have changed
    window.dispatchEvent(new Event('easterncity:bookings-updated'));
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle dashboard-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Listing Title</th>
                <th>Renter</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.itemTitle}</td>
                  <td>{booking.userId}</td>
                  <td>{booking.startDate}</td>
                  <td>{booking.endDate}</td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>
                    {booking.status === "pending" ? (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusChange(booking.id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleStatusChange(booking.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted small">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
      </table>
    </div>
  );
}
