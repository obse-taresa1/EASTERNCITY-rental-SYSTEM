import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { getUsers } from "../../services/authService.js";

export default function AdminManagementPage() {
  const admins = getUsers().filter((user) => user.role === "admin");

  return (
    <main className="dashboard-content">
      <span className="section-label">SUPER ADMIN</span>
      <h1>Admin Management</h1>

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
        rows={admins}
      />
    </main>
  );
}
