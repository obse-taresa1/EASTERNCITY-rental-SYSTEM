/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import {
  dashboardForRole,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  setCurrentUser as saveCurrentUser,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());

  function setCurrentUser(user) {
    setCurrentUserState(user);
    saveCurrentUser(user);
  }

  function login(email, password) {
    const user = loginUser(email, password);
    setCurrentUserState(user);
    return user;
  }

  function register(formData) {
    const user = registerUser(formData);
    setCurrentUserState(user);
    return user;
  }

  function logout() {
    logoutUser();
    setCurrentUserState(null);
  }

  const value = useMemo(
    () => ({
      currentUser,
      user: currentUser,
      isAuthenticated: Boolean(currentUser),
      role: currentUser?.role?.toLowerCase() || "",
      login,
      register,
      logout,
      setCurrentUser,
      dashboardForRole,
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export const getDashboardPath = dashboardForRole;
