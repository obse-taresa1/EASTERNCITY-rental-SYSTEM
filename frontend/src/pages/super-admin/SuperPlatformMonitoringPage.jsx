import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function SuperPlatformMonitoringPage() {
  const [rows, setRows] = useState([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    adminApi.analytics({ range: "today" })
      .then((dashboard) => {
        if (!active) return;
        const counts = dashboard?.counts || {};
        setRows([
          { id: "users", name: "Users Created Today", status: counts.totalUsers || 0 },
          { id: "listings", name: "Listings Created Today", status: counts.totalListings || 0 },
          { id: "promotions", name: "Promotion Requests Today", status: counts.promotionRequests || 0 },
          { id: "support", name: "Support Tickets Today", status: counts.supportTickets || 0 },
          { id: "notifications", name: "Notifications Today", status: counts.notifications || 0 },
        ]);
      })
      .catch((error) => {
        if (active) setNotice(error.response?.data?.message || "Failed to load monitoring data.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="section-label">SUPER ADMIN DASHBOARD</span>
          <h1 className="h3 mb-0">Platform Monitoring</h1>
        </div>
      </div>
      <div className="admin-table-container">
        {notice && <div className="alert alert-warning">{notice}</div>}
        <h2 className="h5 mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-table text-primary-custom"></i> Platform
          Monitoring Data
        </h2>
        <AdminDataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "status", label: "Status" },
          ]}
          rows={rows}
        />
      </div>
    </main>
  );
}
