import { readStorage } from "./storageService.js";

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  "http://localhost:5000";

export function resolveAssetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function buildHeaders(body, headers = {}) {
  const token =
    readStorage("token", null) || readStorage("accessToken", null);
  const nextHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  if (!(body instanceof FormData) && !nextHeaders["Content-Type"]) {
    nextHeaders["Content-Type"] = "application/json";
  }

  return nextHeaders;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function apiRequest(method, path, body, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers: buildHeaders(body, options.headers),
    body:
      body instanceof FormData
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload.data ?? payload;
}

export const apiClient = {
  get(path, options) {
    return apiRequest("GET", path, undefined, options);
  },
  post(path, body, options) {
    return apiRequest("POST", path, body, options);
  },
  patch(path, body, options) {
    return apiRequest("PATCH", path, body, options);
  },
  put(path, body, options) {
    return apiRequest("PUT", path, body, options);
  },
  delete(path, options) {
    return apiRequest("DELETE", path, undefined, options);
  },
};
