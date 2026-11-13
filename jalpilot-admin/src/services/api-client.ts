import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() || "GET";
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCookie("jp_csrf_token");
    if (csrf) {
      config.headers["X-CSRF-Token"] = csrf;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true;
      try {
        await apiClient.post("/auth/refresh");
        return apiClient(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

