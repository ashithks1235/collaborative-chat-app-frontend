import api from "./axios";

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);

  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);

  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
