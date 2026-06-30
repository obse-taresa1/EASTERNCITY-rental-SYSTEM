/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  dashboardForRole,
  getAuthTokens,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshCurrentUser,
  registerUser,
  setCurrentUser as saveCurrentUser,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [tokens, setTokens] = useState(() => getAuthTokens());

  useEffect(() => {
    let isMounted = true;

    refreshCurrentUser()
      .then((user) => {
        if (!isMounted) return;
        setCurrentUserState(user || getCurrentUser());
        setTokens(getAuthTokens());
      })
      .catch(() => {
        if (!isMounted) return;
        setCurrentUserState(getCurrentUser());
        setTokens(getAuthTokens());
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function setCurrentUser(user) {
    setCurrentUserState(user || null);
    saveCurrentUser(user || null);
  }

  async function login(email, password) {
    const user = await loginUser(email, password);
    setCurrentUserState(user || null);
    setTokens(getAuthTokens());
    return user;
  }

  async function register(formData) {
    const user = await registerUser(formData);
    setCurrentUserState(user || null);
    setTokens(getAuthTokens());
    return user;
  }

  async function logout() {
    await logoutUser();
    setCurrentUserState(null);
    setTokens(getAuthTokens());
  }

  const value = useMemo(
    () => ({
      currentUser,
      user: currentUser,
      accessToken: tokens.accessToken || null,
      refreshToken: tokens.refreshToken || null,
      isAuthenticated: Boolean(currentUser && tokens.accessToken),
      role: currentUser?.role?.toLowerCase() || "",
      login,
      register,
      logout,
      setCurrentUser,
      dashboardForRole,
    }),
    [currentUser, tokens],
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
