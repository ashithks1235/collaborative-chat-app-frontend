import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizePayload = (payload) => {
  if (Array.isArray(payload)) {
    if (!Object.prototype.hasOwnProperty.call(payload, "data")) {
      Object.defineProperty(payload, "data", {
        value: payload,
        enumerable: false
      });
    }
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (!Object.prototype.hasOwnProperty.call(payload, "data")) {
      return { ...payload, data: payload };
    }
    return payload;
  }

  return { data: payload };
};

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers || {};

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

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
  (response) => {
    return normalizePayload(response.data);
  },

  async (error) => {
    const originalConfig = error.config || {};
    const status = error.response?.status;
    const method = (originalConfig.method || "").toLowerCase();
    const isIdempotent = ["get", "head", "options"].includes(method);

    if ((error.code === "ECONNABORTED" || !error.response) && isIdempotent) {
      if (!originalConfig.__retryAttempted) {
        originalConfig.__retryAttempted = true;
        await wait(800);
        return api(originalConfig);
      }
    }

    // Network error
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(error);
    }

    // Auth expired
    if (status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register");

      if (!isAuthRequest) {
        console.warn("🔒 Session expired. Logging out...");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
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
