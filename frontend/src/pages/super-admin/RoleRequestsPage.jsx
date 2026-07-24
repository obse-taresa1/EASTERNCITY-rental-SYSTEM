import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function RoleRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    // Fetch users who have a pending verification status (role requests)
    adminApi.users({ verificationStatus: "PENDING" })
      .then((users) => {
        if (!active) return;
        setRequests(
          (users || []).map((user) => ({
            id: user.id,
            name: user.name || user.email,
            requestedRole: user.role || "RENTER",
            reason: user.verificationStatus || "Pending verification",
            status: user.verificationStatus || "PENDING",
          })),
        );
      })
      .catch((error) => {
        if (active) setNotice(error.response?.data?.message || "Failed to load role requests.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="dashboard-content">
      <span className="section-label">SUPER ADMIN</span>
      <h1>Role Requests</h1>
      {notice && <div className="alert alert-warning">{notice}</div>}

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
