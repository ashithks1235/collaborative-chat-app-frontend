import api from "./axios";

export const getProject = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};
