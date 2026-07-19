import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { fetchSuperAdminDashboard } from "../../services/dashboardApiService.js";

export default function RoleRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    let active = true;
    fetchSuperAdminDashboard({ range: "year" }).then((dashboard) => {
      if (!active) return;
      setRequests(
        (dashboard.recentRows || [])
          .filter((row) => String(row.type || "").toLowerCase().includes("verification"))
          .map((row) => ({
            id: row.id,
            name: row.detail,
            requestedRole: "Verification",
            reason: "Verification request",
            status: row.status,
          })),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="dashboard-content">
      <span className="section-label">SUPER ADMIN</span>
      <h1>Role Requests</h1>

      <AdminDataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "requestedRole", label: "Requested Role" },
          { key: "reason", label: "Reason" },
          {
            key: "status",
            label: "Status",
            render: (row) => <StatusBadge status={row.status} />,
          },
        ]}
        rows={requests}
      />
    </main>
  );
}
