import api from "./axios";

export const getNotifications = async (page = 1) => {
  const { data } = await api.get("/notifications", {
    params: { page, limit: 20 }
  });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread-count");
  return data.unreadCount;
};

export const markNotificationRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.put("/notifications/read-all");
};