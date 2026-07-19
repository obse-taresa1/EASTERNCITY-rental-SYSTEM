import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { fetchSuperAdminDashboard } from "../../services/dashboardApiService.js";

export default function ActivityLogsPage() {
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    let active = true;
    fetchSuperAdminDashboard({ range: "year" }).then((dashboard) => {
      if (!active) return;
      setActivityLogs(
        (dashboard.recentRows || []).map((row) => ({
          id: row.id,
          action: row.type,
          actor: row.detail,
          date: row.date ? new Date(row.date).toLocaleDateString() : "-",
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
      <h1>Activity Logs</h1>

      <AdminDataTable
        columns={[
          { key: "action", label: "Action" },
          { key: "actor", label: "Actor" },
          { key: "date", label: "Date" },
        ]}
        rows={activityLogs}
      />
    </main>
  );
}
