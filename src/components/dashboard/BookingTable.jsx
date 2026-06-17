import StatusBadge from "../common/StatusBadge.jsx";
import { formatCurrency } from "../../utils/currency.js";

export default function BookingTable({ bookings }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle dashboard-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Dates</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={booking.itemImage}
                    alt={booking.itemTitle}
                    className="dashboard-table-img"
                  />
                  <span>{booking.itemTitle}</span>
                </div>
              </td>

              <td>
                {booking.startDate} to {booking.endDate}
              </td>

              <td>{formatCurrency(booking.totalAmount)}</td>

              <td>{booking.paymentMethod}</td>

              <td>
                <StatusBadge status={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}