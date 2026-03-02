import api from "./axios";

/* ===========================
   GET ALL USERS (SuperAdmin)
=========================== */
export const getAllUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

/* ===========================
   GET CURRENT USER
=========================== */
export const getMe = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

/* ===========================
   DELETE USER (SuperAdmin)
=========================== */
export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
};

/* ===========================
   DEACTIVATE USER
=========================== */
export const deactivateUser = async (userId) => {
  const { data } = await api.patch(`/users/${userId}/deactivate`);
  return data;
};

/* ===========================
   ACTIVATE USER
=========================== */
export const activateUser = async (userId) => {
  const { data } = await api.patch(`/users/${userId}/activate`);
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.patch(`/users/${userId}/role`, { role });
  return data;
};