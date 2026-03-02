import api from "./axios";

export const getMyChannels = async () => {
  const { data } = await api.get("/channels");
  return data;
};

export const getChannelById = async (channelId) => {
  const { data } = await api.get(`/channels/${channelId}`);
  return data;
};

export const createChannel = async (payload) => {
  const { data } = await api.post("/channels", payload);
  return data;
};

export const addMemberToChannel = async (channelId, payload) => {
  const { data } = await api.post(`/channels/${channelId}/members`, payload);
  return data;
};
