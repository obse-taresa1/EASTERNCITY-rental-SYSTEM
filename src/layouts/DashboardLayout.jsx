import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/layout/PublicNavbar.jsx";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";

export default function DashboardLayout() {
  useEffect(() => {
    document.body.setAttribute("data-unified-dashboard", "true");
    return () => {
      document.body.removeAttribute("data-unified-dashboard");
    };
  }, []);

  return (
    <div className="unified-dashboard-shell">
      <PublicNavbar />
      <div className="unified-dashboard-body">
        <DashboardSidebar />
        <main className="unified-dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
