import api from "../api/axios";

export const fetchChannels = async () => {
  const { data } = await api.get("/channels");
  return data;
};
