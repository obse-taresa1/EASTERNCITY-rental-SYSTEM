import AdminDataTable from "../../components/admin/AdminDataTable.jsx";

const activityLogs = [
  {
    id: "log-1",
    action: "User login",
    actor: "Admin User",
    date: "2026-06-18",
  },
  {
    id: "log-2",
    action: "Booking created",
    actor: "Renter User",
    date: "2026-06-18",
  },
];

export default function ActivityLogsPage() {
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
