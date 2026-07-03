import axios from "axios";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

function unwrapResponse(response) {
  const payload = response?.data || {};
  return payload.data ?? payload;
}

async function apiRequest(method, path, data, options = {}) {
  try {
    const response = await api.request({
      url: path,
      method,
      data,
      ...options,
    });
    return unwrapResponse(response);
  } catch (error) {
    const message =
      error?.response?.data?.message || error.message || "Request failed.";
    throw new Error(message);
  }
}

export { api };

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
