import { apiClient, resolveAssetUrl } from "./apiClient.js";
import { emitRefresh } from "../context/RefreshContext.jsx";

function normalizeUser(user) {
  if (!user) return null;
  const profileImageUrl = resolveAssetUrl(user.profileImageUrl || user.profileImage || user.avatar);
  return {
    ...user,
    role: String(user.role || "USER").toUpperCase(),
    status: String(user.status || "ACTIVE").toLowerCase(),
    profileImageUrl,
    profileImage: profileImageUrl,
    avatar: profileImageUrl,
  };
}

function emitUsersUpdate() {
  emitRefresh("users");
}

export async function updateUser(id, payload) {
  const data = await apiClient.put(`/api/users/${id}`, payload);
  emitUsersUpdate();
  return normalizeUser(data);
}

export async function updateUserProfileImage(id, file) {
  const formData = new FormData();
  formData.append("profileImage", file);
  const data = await apiClient.put(`/api/users/${id}/profile-image`, formData);
  emitUsersUpdate();
  const user = normalizeUser(data);
  return {
    ...user,
    profileImageUrl: resolveAssetUrl(user?.profileImageUrl),
    profileImage: resolveAssetUrl(user?.profileImageUrl),
    avatar: resolveAssetUrl(user?.profileImageUrl),
  };
}
