import api from "./axios";

export const getMessages = async (channelId) => {
  const { data } = await api.get(`/messages/${channelId}`);
  return data;
};

export const sendMessage = async (payload) => {
  const { data } = await api.post("/messages", payload);
  return data;
};

export const pinMessage = async (messageId) => {
  const { data } = await api.patch(`/messages/${messageId}/pin`);
  return data;
};

export const convertMessageToTask = async (messageId, payload) => {
  const { data } = await api.post(`/messages/${messageId}/task`, payload);
  return data;
};
