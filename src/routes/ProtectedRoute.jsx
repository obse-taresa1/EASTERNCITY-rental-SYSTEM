import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Errors 1 & 2: Fixed template literal with backticks
    localStorage.setItem(
      "pendingRentalUrl",
      `${location.pathname}${location.search}`,
    );

    return <Navigate to="/login" replace />;
  }

  // Error 3: Clarified return logic (optional improvement)
  return children ? children : <Outlet />;
}