import api from "../api/axios";

export const fetchAdminOverview = async () => {
  const res = await api.get("/admin/overview");
  return res.data;
};
