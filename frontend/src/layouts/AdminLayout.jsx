import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell admin-red-shell">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <AdminTopbar title="Admin" onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <Suspense fallback={<LoadingSpinner fullPage={true} />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
