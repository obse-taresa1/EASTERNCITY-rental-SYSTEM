import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import DashboardTopbar from "../components/dashboard/DashboardTopbar.jsx";

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <DashboardSidebar />

      <div className="dashboard-main">
        <DashboardTopbar />
        <Outlet />
      </div>
    </div>
  );
}
