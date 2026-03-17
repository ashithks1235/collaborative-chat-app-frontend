import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    // Network error
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(error);
    }

    // Auth expired
    if (status === 401) {
      console.warn("🔒 Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    // Rate limited
    if (status === 429) {
      console.warn("⚠️ Too many requests. Slow down.");
    }

    // Server error
    if (status === 500 && !error.config.__isRetry) {
      console.error("🚨 Server error occurred");
    }

    return Promise.reject(error);
  }
);

export default api;