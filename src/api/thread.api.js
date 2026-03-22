import api from "./axios";

export const sendThreadReply = (data) =>
  api.post(`/messages/${data.parentId}/reply`, { text: data.text });

export const getThreadReplies = (messageId) =>
  api.get(`/messages/${messageId}/replies`);
