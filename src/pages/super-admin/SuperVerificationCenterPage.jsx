import AdminDataTable from "../../components/admin/AdminDataTable.jsx";

export default function SuperVerificationCenterPage() {
  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="section-label">SUPER ADMIN DASHBOARD</span>
          <h1 className="h3 mb-0">Verification Center</h1>
        </div>
      </div>
      <div className="admin-table-container">
        <h2 className="h5 mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-table text-primary-custom"></i> Verification Center Data
        </h2>
        <AdminDataTable
          columns={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "status", label: "Status" } ]}
          rows={[{ id: 1, name: "Sample Data", status: "Active" }]}
        />
      </div>
    </main>
  );
}
