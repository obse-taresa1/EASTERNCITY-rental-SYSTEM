import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell admin-red-shell super-admin-red-shell">
      <AdminSidebar variant="superadmin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <AdminTopbar title="Super Admin" onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <Outlet />
      </div>
    </div>
  );
}
