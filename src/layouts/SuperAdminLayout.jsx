import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

export default function SuperAdminLayout() {
  return (
    <div className="dashboard-shell">
      <AdminSidebar variant="superadmin" />

      <div className="dashboard-main">
        <AdminTopbar title="Super Admin Panel" />
        <Outlet />
      </div>
    </div>
  );
}
