import StatusBadge from "../../common/StatusBadge.jsx";

export default function PromotionRequestsTable({ promotions }) {
  return (
    <div className="premium-glass-card bg-white p-4">
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Promotion Type</th>
              <th>Request Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td className="fw-bold">{promotion.listingTitle}</td>
                <td>{promotion.promotionType}</td>
                <td>{promotion.requestDate}</td>
                <td>
                  <StatusBadge status={promotion.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
