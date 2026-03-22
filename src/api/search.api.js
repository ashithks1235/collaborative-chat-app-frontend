import api from "./axios";

export const globalSearch = async (q) => {
  const { data } = await api.get("/messages/search", {
    params: { q }
  });
  return data;
};
