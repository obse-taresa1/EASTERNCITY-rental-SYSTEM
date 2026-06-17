import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardPathByRole = {
  renter: "/renter-dashboard",
  lessor: "/lessor-dashboard",
  both: "/both-dashboard",
  admin: "/admin",
  superadmin: "/super-admin",
};

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase(),
  );

  if (normalizedAllowedRoles.length === 0) {
    // Error 1: Fixed missing || operator
    return children || <Outlet />;
  }

  // Error 2: Fixed missing || operator
  const userRole = String(user.role || "").toLowerCase();

  if (!normalizedAllowedRoles.includes(userRole)) {
    // Error 3: Fixed missing || operator
    return <Navigate to={dashboardPathByRole[userRole] || "/"} replace />;
  }

  // Error 4: Fixed missing || operator
  return children || <Outlet />;
}