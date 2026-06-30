import { useEffect, useState } from "react";
import { fetchOwnerPromotions } from "../../services/promotionService.js";
import { promotionPackages } from "../../data/promotions.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function PromotionHistoryPage() {
  const { currentUser } = useAuth();
  const ownerId = currentUser?.id || "user";

  const [history, setHistory] = useState(() => fetchOwnerPromotions(ownerId));

  useEffect(() => {
    const refreshHistory = () => setHistory(fetchOwnerPromotions(ownerId));
    window.addEventListener("easterncity:promotions-updated", refreshHistory);
    return () =>
      window.removeEventListener(
        "easterncity:promotions-updated",
        refreshHistory,
      );
  }, [ownerId]);

  const getPackageName = (pkgId) => {
    const pkg = promotionPackages.find((p) => p.id === pkgId);
    return pkg ? pkg.name : `Package #${pkgId}`;
  };

  return (
    <main className="dashboard-content">
      <div className="mb-4">
        <span className="section-label">ADMIN</span>
        <h1 className="h3 mb-1">Promotion History</h1>
        <p className="text-muted mb-0">
          Track the status and history of all promotion requests.
        </p>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Package</th>
                <th>Requested</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No promotion history found.
                  </td>
                </tr>
              ) : (
                history.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold">{p.listingTitle || p.listingId}</td>
                    <td>{p.promotionType || getPackageName(p.packageId)}</td>
                    <td>{p.requestDate || "—"}</td>
                    <td>{p.startDate || "—"}</td>
                    <td>{p.endDate || "—"}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

