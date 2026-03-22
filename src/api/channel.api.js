import api from "./axios";

export const getMyChannels = async () => {
  const res = await api.get("/channels");
  return res?.data || res || [];
};

export const getChannelById = async (channelId) => {
  const res = await api.get(`/channels/${channelId}`);
  return res?.data || res || [];
};

export const createChannel = async (payload) => {
  const res = await api.post("/channels", payload);
  return res?.data || res || [];
};

export const addMemberToChannel = async (channelId, payload) => {
  const res = await api.post(`/channels/${channelId}/members`, payload);
  return res?.data || res || [];
};
