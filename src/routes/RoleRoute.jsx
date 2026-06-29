import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardForRole, normalizeRole } from "../services/authService.js";

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  // If no authenticated user, redirect to login
  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  // Normalize allowed roles for comparison
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    normalizeRole(role),
  );

  // If no specific role restriction, render children or outlet
  if (normalizedAllowedRoles.length === 0) {
    return children || <Outlet />;
  }

  // Determine the user's role (normalize for consistency)
  const userRole = normalizeRole(activeUser.role);

  // If role not allowed, redirect to appropriate dashboard for that role
  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to={dashboardForRole(userRole)} replace />;
  }

  // Role is allowed – render children or outlet
  return children || <Outlet />;
}
