import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  withCredentials: true, // REQUIRED for refresh cookie
});

/* ------------------------------
   Request interceptor
-------------------------------- */
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* ------------------------------
   Response interceptor (refresh)
-------------------------------- */
let isRefreshing = false;
let queue = [];

function resolveQueue(error, token) {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;
    const code = err.response?.data?.code;

    // 🔑 ONLY refresh when access token is expired
    if (status === 401 && code === "TOKEN_EXPIRED" && !original._retry) {
      original._retry = true;

      // If refresh already in progress, wait
      if (isRefreshing) {
        const newToken = await new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        });
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        // store new token
        useAuthStore.getState().setAccessToken(newAccessToken);

        resolveQueue(null, newAccessToken);
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        isRefreshing = false;

        // refresh failed → force logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);
