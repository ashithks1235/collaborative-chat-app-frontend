import api from "./axios";

/* ===============================
   GET PROJECT BOARD (KANBAN)
=============================== */
export const getProjectBoard = async (projectId) => {
  if (!projectId) return [];

  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data?.data || [];
};

/* ===============================
   CREATE TASK
=============================== */
export const createTask = async (projectId, payload) => {
  const res = await api.post(`/projects/${projectId}/tasks`, payload);
  return res.data?.data;
};

/* ===============================
   MOVE TASK
=============================== */
export const moveTask = async (taskId, targetColumnId, newOrder) => {
  const res = await api.put(`/tasks/${taskId}/move`, {
    targetColumnId,
    newOrder
  });
  return res.data?.data;
};

/* ===============================
   UPDATE TASK
=============================== */
export const updateTask = async (taskId, payload) => {
  const res = await api.put(`/tasks/${taskId}`, payload);
  return res.data?.data;
};

/* ===============================
   CONVERT MESSAGE TO TASK
=============================== */
export const convertMessageToTask = async (messageId) => {
  const res = await api.post(`/messages/${messageId}/convert-to-task`);
  return res.data?.data;
};