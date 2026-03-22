import api from "./axios";

export const loginUser = async (credentials) => {
  const payload = await api.post("/auth/login", credentials);
  const token = payload?.token ?? payload?.data?.token;

  if (!token) {
    throw new Error("Login response is missing token");
  }

  localStorage.setItem("token", token);
  if (payload?.user) {
    localStorage.setItem("user", JSON.stringify(payload.user));
  }

  return payload;
};

export const registerUser = async (userData) => {
  const payload = await api.post("/auth/register", userData);
  const token = payload?.token ?? payload?.data?.token;

  if (!token) {
    throw new Error("Register response is missing token");
  }

  localStorage.setItem("token", token);
  if (payload?.user) {
    localStorage.setItem("user", JSON.stringify(payload.user));
  }

  return payload;
};

export const forgotPassword = async (data) => {
  return api.post("/auth/forgot-password", data);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
