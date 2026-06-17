import StatusBadge from "../common/StatusBadge.jsx";
import { formatDailyPrice } from "../../utils/currency.js";

export default function ListingManagementTable({ items }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle dashboard-table">
        <thead>
          <tr>
            <th>Listing</th>
            <th>Category</th>
            <th>Price</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="dashboard-table-img"
                  />
                  <span>{item.title}</span>
                </div>
              </td>

              <td className="text-capitalize">{item.category}</td>
              <td>{formatDailyPrice(item.pricePerDay)}</td>
              <td>{item.location}</td>
              <td>
                <StatusBadge status={item.available ? "active" : "inactive"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}