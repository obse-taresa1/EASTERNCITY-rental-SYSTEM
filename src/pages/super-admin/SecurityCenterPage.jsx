import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { fetchSuperAdminDashboard } from "../../services/dashboardApiService.js";

export default function SecurityCenterPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let active = true;
    fetchSuperAdminDashboard({ range: "year" }).then((dashboard) => {
      if (!active) return;
      const counts = dashboard.counts || {};
      setRows([
        {
          id: "system-health",
          name: "System Health",
          status: `${counts.systemHealth || 0}%`,
        },
        {
          id: "admin-accounts",
          name: "Admin Accounts",
          status: `${counts.totalAdmins || 0} active records`,
        },
        {
          id: "notifications",
          name: "Security Notifications",
          status: `${counts.notifications || 0} records`,
        },
      ]);
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
          <h1 className="h3 mb-0">Security Center</h1>
        </div>
      </div>
      <div className="admin-table-container">
        <h2 className="h5 mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-table text-primary-custom"></i> Security Center Data
        </h2>
        <AdminDataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
          rows={rows}
        />
      </div>
    </main>
  );
}
