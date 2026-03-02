import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // 🔥 important if backend uses cookies / CORS
  headers: {
    "Content-Type": "application/json",
  },
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

    // 🔐 Auto logout on auth failure
    if (status === 401) {
      console.warn("🔒 Session expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Navigation handled elsewhere
    }

    // 🚨 Global server error
    if (status === 500) {
      console.error("Server error");
      alert("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
