import api from "./axios";

export const globalSearch = async (q) => {
  const { data } = await api.get(`/search?q=${q}`);
  return data;
};
