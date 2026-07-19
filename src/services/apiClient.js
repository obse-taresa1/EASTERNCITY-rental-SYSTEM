const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

function buildHeaders(headers = {}) {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload.data ?? payload;
}

export const apiClient = {
  get(path, options) {
    return apiRequest(path, { ...options, method: "GET" });
  },
  post(path, body, options) {
    return apiRequest(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body || {}),
    });
  },
  patch(path, body, options) {
    return apiRequest(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body || {}),
    });
  },
  put(path, body, options) {
    return apiRequest(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body || {}),
    });
  },
  delete(path, options) {
    return apiRequest(path, { ...options, method: "DELETE" });
  },
};

