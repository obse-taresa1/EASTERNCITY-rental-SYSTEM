import { formatCurrency, formatDailyPrice } from "../../utils/currency.js";

export default function BookingSummary({
  item,
  startDate,
  endDate,
  totalDays,
  totalAmount,
  paymentMethod,
}) {
  // Optional: Add null check for item
  if (!item) {
    return null;
  }

  return (
    <aside className="booking-summary">
      <h3 className="h5 mb-3">Booking Summary</h3>

      <div className="booking-summary-item">
        {/* Error 3: Fixed alt text */}
        <img src={item.image} alt={item.title || "Item image"} />
        <div>
          {/* Error 4: Fixed title and location fallbacks */}
          <h4>{item.title || "Untitled"}</h4>
          <p>{item.location || "Location not specified"}</p>
        </div>
      </div>

      <ul className="list-unstyled mt-4 mb-0">
        <li className="d-flex justify-content-between mb-2">
          <span>Price</span>
          <strong>{formatDailyPrice(item.pricePerDay || 0)}</strong>
        </li>

        <li className="d-flex justify-content-between mb-2">
          <span>Start Date</span>
          {/* Error 1: Fixed missing || operator */}
          <strong>{startDate || "-"}</strong>
        </li>

        <li className="d-flex justify-content-between mb-2">
          <span>End Date</span>
          {/* Error 2: Fixed missing || operator */}
          <strong>{endDate || "-"}</strong>
        </li>

        <li className="d-flex justify-content-between mb-2">
          <span>Total Days</span>
          <strong>{totalDays || 0}</strong>
        </li>

        <li className="d-flex justify-content-between mb-2">
          <span>Payment Method</span>
          <strong>{paymentMethod || "-"}</strong>
        </li>

        <li className="d-flex justify-content-between border-top pt-3 mt-3">
          <span>Total</span>
          <strong>{formatCurrency(totalAmount || 0)}</strong>
        </li>
      </ul>
    </aside>
  );
}