import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

export default function AdminLayout() {
  return (
    <div className="dashboard-shell admin-red-shell">
      <AdminSidebar />

      <div className="admin-main">
        <AdminTopbar title="Admin" />
        <Outlet />
      </div>
    </div>
  );
}