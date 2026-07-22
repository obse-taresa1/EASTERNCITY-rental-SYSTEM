import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function RoleRequestsPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { adminApi.users().then((users) => setRows(users.filter((u) => String(u.verificationStatus).toUpperCase() === "PENDING").map((u) => ({ id: u.id, name: u.name, requestedRole: u.role, reason: "Verification pending", status: u.verificationStatus })))).catch(console.error); }, []);
  return <main className="dashboard-content"><span className="section-label">SUPER ADMIN</span><h1>Role Requests</h1><AdminDataTable columns={[{ key: "name", label: "Name" }, { key: "requestedRole", label: "Requested Role" }, { key: "reason", label: "Reason" }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }]} rows={rows} /></main>;
}
