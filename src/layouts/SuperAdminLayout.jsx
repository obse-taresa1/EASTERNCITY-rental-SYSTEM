import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

export default function SuperAdminLayout() {
  return (
    <div className="dashboard-shell admin-red-shell super-admin-red-shell">
      <AdminSidebar variant="superadmin" />

      <div className="admin-main">
        <AdminTopbar title="Super Admin" />
        <Outlet />
      </div>
    </div>
  );
}