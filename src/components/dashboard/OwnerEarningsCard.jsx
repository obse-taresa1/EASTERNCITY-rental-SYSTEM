import { formatCurrency } from "../../utils/currency.js";

export default function OwnerEarningsCard({ totalEarnings, bookingCount }) {
  return (
    <div className="owner-earnings-card">
      <div>
        <p className="text-muted mb-1">Owner Earnings</p>
        <h2 className="mb-0">{formatCurrency(totalEarnings)}</h2>
      </div>

      <div className="owner-earnings-icon">
        <i className="bi bi-wallet2" />
      </div>

      <p className="text-muted mb-0 mt-3">
        Based on {bookingCount} completed or pending booking records.
      </p>
    </div>
  );
}