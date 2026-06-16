import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  setCurrentUser as saveCurrentUser,
  authenticateUser,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  function login(email, password) {
    const user = authenticateUser(email, password);
    if (!user) return null;
    setCurrentUser(user);
    return user;
  }

  function logout() {
    setCurrentUser(null);
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      role: currentUser?.role?.toLowerCase() || "",
      login,
      logout,
      setCurrentUser,
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
