import { apiClient } from "./apiClient.js";
import { readStorage, removeStorage, writeStorage } from "./storageService.js";
import { users as defaultUsers } from "../data/users.js";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const USE_MOCK_AUTH = String(import.meta.env?.VITE_USE_MOCK_AUTH ?? "false") === "true";

function createMockTokens(user) {
  return {
    accessToken: `mock-access-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
  };
}

function persistAuthSession({ user, accessToken, refreshToken }) {
  if (accessToken) writeStorage(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) writeStorage(REFRESH_TOKEN_KEY, refreshToken);
  setCurrentUser(user || null);
}

export function getAuthTokens() {
  return {
    accessToken: readStorage(ACCESS_TOKEN_KEY, null),
    refreshToken: readStorage(REFRESH_TOKEN_KEY, null),
  };
}

export function clearAuthSession() {
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
  removeStorage(CURRENT_USER_KEY);
}

export function getUsers() {
  const storedUsers = readStorage(USERS_KEY, null);

  if (Array.isArray(storedUsers)) {
    const storedUserIds = new Set(storedUsers.map((user) => user.id));
    const storedUserEmails = new Set(
      storedUsers.map((user) => user.email?.toLowerCase()).filter(Boolean),
    );
    const missingDefaultUsers = defaultUsers.filter(
      (user) =>
        !storedUserIds.has(user.id) &&
        !storedUserEmails.has(user.email?.toLowerCase()),
    );

    if (missingDefaultUsers.length > 0) {
      const mergedUsers = [...missingDefaultUsers, ...storedUsers];
      writeStorage(USERS_KEY, mergedUsers);
      return mergedUsers;
    }

    return storedUsers;
  }

  writeStorage(USERS_KEY, defaultUsers);
  return defaultUsers;
}

export function saveUsers(users) {
  writeStorage(USERS_KEY, users);
}

export function getCurrentUser() {
  const currentUser = readStorage(CURRENT_USER_KEY, null);

  if (!currentUser || typeof currentUser !== "object") {
    return null;
  }

  if (USE_MOCK_AUTH && !readStorage(ACCESS_TOKEN_KEY, null)) {
    const tokens = createMockTokens(currentUser);
    writeStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
    writeStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  return currentUser;
}

export function setCurrentUser(user) {
  if (!user) {
    removeStorage(CURRENT_USER_KEY);
    return;
  }

  writeStorage(CURRENT_USER_KEY, user);
}

export function authenticateUser(email, password) {
  return (
    getUsers().find(
      (user) =>
        user.email?.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    ) || null
  );
}

function toSafeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: coerceRole(user.role),
    businessName: user.businessName || "",
    verificationStatus: user.verificationStatus || "Pending Verification",
  };
}

function normalizeAuthPayload(payload) {
  const data = payload?.data || payload || {};
  const user = data.user || data.currentUser || data;
  return {
    user: toSafeUser(user),
    accessToken: data.accessToken || data.token || data.access_token,
    refreshToken: data.refreshToken || data.refresh_token,
  };
}

export async function loginUser(email, password) {
  if (!USE_MOCK_AUTH) {
    const payload = normalizeAuthPayload(
      await apiClient.post("/api/auth/login", { email, password }),
    );
    persistAuthSession(payload);
    return payload.user;
  }

  const user = authenticateUser(email, password);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const safeUser = toSafeUser(user);
  persistAuthSession({ user: safeUser, ...createMockTokens(safeUser) });
  return safeUser;
}

export async function registerUser(formData) {
  if (!USE_MOCK_AUTH) {
    const payload = normalizeAuthPayload(
      await apiClient.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    );
    persistAuthSession(payload);
    return payload.user;
  }

  const users = getUsers();

  const existingUser = users.find(
    (user) => user.email?.toLowerCase() === formData.email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: formData.name,
    email: formData.email,
    password: formData.password,
    role: "USER",
    businessName: formData.businessName || "",
    nationalIdFront: formData.nationalIdFrontPath || (formData.nationalIdFront ? "uploaded" : ""),
    nationalIdBack: formData.nationalIdBackPath || (formData.nationalIdBack ? "uploaded" : ""),
    verificationStatus: "Pending Verification",
  };

  saveUsers([newUser, ...users]);

  const safeUser = toSafeUser(newUser);
  persistAuthSession({ user: safeUser, ...createMockTokens(safeUser) });
  return safeUser;
}

export async function refreshCurrentUser() {
  const currentUser = getCurrentUser();

  if (USE_MOCK_AUTH || !getAuthTokens().accessToken) {
    return currentUser;
  }

  const payload = normalizeAuthPayload(await apiClient.get("/api/users/me"));
  persistAuthSession({
    user: payload.user,
    ...getAuthTokens(),
  });
  return payload.user;
}

export async function logoutUser() {
  if (!USE_MOCK_AUTH && getAuthTokens().accessToken) {
    await apiClient.post("/api/auth/logout").catch(() => null);
  }

  clearAuthSession();
}

export function dashboardForRole(role) {
  const normalized = coerceRole(role);
  const routes = {
    SUPER_ADMIN: "/super-admin-dashboard",
    ADMIN: "/admin-dashboard",
    USER: "/dashboard",
  };

  return routes[normalized] || "/dashboard";
}

export function coerceRole(role) {
  const normalized = String(role || "USER").toUpperCase();
  if (normalized === "SUPERADMIN") return "SUPER_ADMIN";
  if (["USER", "ADMIN", "SUPER_ADMIN"].includes(normalized)) return normalized;
  return "USER";
}
