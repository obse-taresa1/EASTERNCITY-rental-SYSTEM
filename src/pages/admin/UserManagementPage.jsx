import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { getUsers } from "../../services/authService.js";

export default function UserManagementPage() {
  const users = getUsers();

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>User Management</h1>

      <AdminDataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          {
            key: "status",
            label: "Status",
            render: () => <StatusBadge status="active" />,
          },
        ]}
        rows={users}
      />
    </main>
  );
}
