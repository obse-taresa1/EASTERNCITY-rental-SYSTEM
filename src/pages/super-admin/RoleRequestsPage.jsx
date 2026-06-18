import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { roleRequests } from "../../data/roleRequests.js";

export default function RoleRequestsPage() {
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
        rows={roleRequests}
      />
    </main>
  );
}
