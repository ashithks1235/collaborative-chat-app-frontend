import api from "./axios";

export const getTodayFocus = async () => {
  const { data } = await api.get("/focus/today");
  return data;
};
