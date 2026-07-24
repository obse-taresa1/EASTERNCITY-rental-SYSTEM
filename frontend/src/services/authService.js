import { apiClient, resolveAssetUrl } from "./apiClient.js";
import { readStorage, removeStorage, writeStorage } from "./storageService.js";
import { normalizeVerificationStatus } from "../utils/verificationStatus.js";

const TOKEN_KEY = "token";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const CURRENT_USER_KEY = "currentUser";

export const USE_MOCK_AUTH = String(import.meta.env?.VITE_USE_MOCK_AUTH ?? "false") === "true";

function persistAuthSession({ user, accessToken, refreshToken }) {
  if (accessToken) {
    writeStorage(TOKEN_KEY, accessToken);
    writeStorage(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    writeStorage(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    writeStorage(CURRENT_USER_KEY, toSafeUser(user));
  }

  return user || null;
}

export function getAuthTokens() {
  const accessToken =
    readStorage(TOKEN_KEY, null) || readStorage(ACCESS_TOKEN_KEY, null);

  return {
    accessToken,
    refreshToken: readStorage(REFRESH_TOKEN_KEY, null),
  };
}

export function clearAuthSession() {
  removeStorage(TOKEN_KEY);
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
  removeStorage(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  return toSafeUser(readStorage(CURRENT_USER_KEY, null));
}

export function setCurrentUser(user) {
  if (!user) {
    removeStorage(CURRENT_USER_KEY);
    return null;
  }

  const safeUser = toSafeUser(user);
  writeStorage(CURRENT_USER_KEY, safeUser);
  return safeUser;
}

function toSafeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: coerceRole(user.role),
    status: user.status || "",
    createdAt: user.createdAt || "",
    businessName: user.businessName || "",
    city: user.city || "",
    sefer: user.sefer || "",
    address: user.address || "",
    nationalIdFront: resolveAssetUrl(user.nationalIdFront || user.nationalIdFrontUrl),
    nationalIdBack: resolveAssetUrl(user.nationalIdBack || user.nationalIdBackUrl),
    nationalIdFrontUrl: resolveAssetUrl(user.nationalIdFrontUrl || user.nationalIdFront),
    nationalIdBackUrl: resolveAssetUrl(user.nationalIdBackUrl || user.nationalIdBack),
    verificationStatus: normalizeVerificationStatus(user.verificationStatus),
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
  const payload = normalizeAuthPayload(
    await apiClient.post("/api/auth/login", { email, password }),
  );
  persistAuthSession(payload);
  return payload.user;
}

export async function registerUser(formData) {
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

export async function refreshCurrentUser() {
  if (!getAuthTokens().accessToken) {
    return null;
  }

  const payload = normalizeAuthPayload(await apiClient.get("/api/users/me"));
  persistAuthSession({
    user: payload.user,
    ...getAuthTokens(),
  });
  return payload.user;
}

export async function logoutUser() {
  const { refreshToken } = getAuthTokens();

  if (refreshToken) {
    await apiClient
      .post("/api/auth/logout", { refreshToken })
      .catch(() => null);
  }

  clearAuthSession();
}

export async function requestPasswordReset(email) {
  return apiClient.post("/api/auth/forgot-password", { email });
}

export async function resetPassword({ token, newPassword, confirmPassword }) {
  return apiClient.post("/api/auth/reset-password", {
    token,
    newPassword,
    confirmPassword,
  });
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
