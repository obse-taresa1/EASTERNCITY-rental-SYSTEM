import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

export default function SecurityCenterPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { adminApi.logs({ type: "SECURITY" }).then((logs) => setRows(logs.map((log) => ({ id: log.id, name: log.action, status: log.actorName || "System", date: formatDate(log.createdAt) })))).catch(console.error); }, []);
  return <main className="dashboard-content"><div className="d-flex justify-content-between align-items-end mb-4"><div><span className="section-label">SUPER ADMIN DASHBOARD</span><h1 className="h3 mb-0">Security Center</h1></div></div><div className="admin-table-container"><h2 className="h5 mb-3 d-flex align-items-center gap-2"><i className="bi bi-table text-primary-custom"></i> Security Center Data</h2><AdminDataTable columns={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "status", label: "Status" }, { key: "date", label: "Date" }]} rows={rows} /></div></main>;
}
