import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { getUsers, normalizeRole } from "../../services/authService.js";
import { getAllItems } from "../../services/itemService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function SuperAdminDashboardPage() {
  const users = getUsers();
  const items = getAllItems();
  
  const admins = users.filter((user) =>
    ["ADMIN", "SUPER_ADMIN"].includes(normalizeRole(user.role)),
  );
  const totalCategories = 4; 
  const featuredListingsCount = items.filter(i => i.isFeatured || i.rating >= 4.8).length;
  const activePromotions = 8;
  const totalRevenue = 15400; // Promotion revenue only

  const activityLogs = [
    { id: "log-1", action: "System Update", status: "Success", date: "2026-06-25 10:30" },
    { id: "log-2", action: "New Admin Added", status: "Success", date: "2026-06-25 09:15" },
    { id: "log-3", action: "Failed Login Attempt", status: "Warning", date: "2026-06-24 18:45" },
    { id: "log-4", action: "Database Backup", status: "Success", date: "2026-06-24 02:00" },
  ];

  const stats = [
    { icon: "bi-people", label: "Total Platform Users", value: users.length },
    { icon: "bi-shield-lock", label: "Total Admins", value: admins.length },
    { icon: "bi-box-seam", label: "Total Listings", value: items.length },
    { icon: "bi-tags", label: "Total Categories", value: totalCategories },
    { icon: "bi-cash-stack", label: "Total Revenue", value: formatCurrency(totalRevenue) },
    { icon: "bi-award", label: "Featured Listings", value: featuredListingsCount },
    { icon: "bi-fire", label: "Active Promotions", value: activePromotions },
    { icon: "bi-graph-up", label: "Platform Growth", value: "+18%" },
  ];

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Dashboard Overview</h1>
        </div>
      </div>

      <AdminStatGrid stats={stats} />

      <div className="row mt-4">
        <div className="col-lg-12 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary-custom"></i> Recent System Activity
            </h2>
            <AdminDataTable
              columns={[
                { key: "action", label: "Action" },
                { key: "status", label: "Status" },
                { key: "date", label: "Timestamp" },
              ]}
              rows={activityLogs}
            />
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-shield-shaded text-primary-custom"></i> Security Alerts
            </h2>
            <p className="text-muted mb-0">No active security threats detected. Firewall is active.</p>
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cpu text-primary-custom"></i> Server Performance
            </h2>
            <p className="text-muted mb-0">CPU: 12% | RAM: 3.4GB / 8GB | Storage: 45%</p>
          </div>
        </div>
      </div>
    </main>
  );
}
