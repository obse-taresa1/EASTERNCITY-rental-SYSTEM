import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

export default function ActivityLogsPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { adminApi.logs({ type: "ACTIVITY" }).then((logs) => setRows(logs.map((log) => ({ id: log.id, action: log.action, actor: log.actorName || log.actor?.email || "System", date: formatDate(log.createdAt) })))).catch(console.error); }, []);
  return <main className="dashboard-content"><span className="section-label">SUPER ADMIN</span><h1>Activity Logs</h1><AdminDataTable columns={[{ key: "action", label: "Action" }, { key: "actor", label: "Actor" }, { key: "date", label: "Date" }]} rows={rows} /></main>;
}
