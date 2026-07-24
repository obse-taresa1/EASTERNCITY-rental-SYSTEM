import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function ActivityLogsPage() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setNotice("");
    adminApi.logs({ limit: 100 }).then((logs) => {
      if (!active) return;
      setActivityLogs(
        (logs || []).map((row) => ({
          id: row.id,
          action: row.action || row.type,
          actor: row.admin?.name || row.admin?.email || row.userId || row.detail || "System",
          date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : (row.date ? new Date(row.date).toLocaleDateString() : "-"),
        })),
      );
    }).catch((error) => {
      if (active) setNotice(error.response?.data?.message || "Failed to load activity logs.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="dashboard-content">
      <span className="section-label">SUPER ADMIN</span>
      <h1>Activity Logs</h1>
      {notice && <div className="alert alert-warning">{notice}</div>}

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
