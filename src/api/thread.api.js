import api from "./axios";

export const sendThreadReply = (data) =>
  api.post("/threads", data);

export const getThreadReplies = (messageId) =>
  api.get(`/threads/${messageId}`);
