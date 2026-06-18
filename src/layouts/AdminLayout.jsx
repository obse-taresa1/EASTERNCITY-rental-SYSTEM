import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

export default function AdminLayout() {
  return (
    <div className="dashboard-shell">
      <AdminSidebar />

      <div className="dashboard-main">
        <AdminTopbar title="Admin Panel" />
        <Outlet />
      </div>
    </div>
  );
}
