import api from "./axios";

/* ===============================
   GET PROJECT BOARD (KANBAN)
=============================== */
export const getProjectBoard = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data ?? res ?? [];
};

/* ===============================
   CREATE TASK
=============================== */
export const createTask = async (projectId, payload) => {
  const res = await api.post(`/projects/${projectId}/tasks`, payload);
  return res;
};

/* ===============================
   MOVE TASK
=============================== */
export const moveTask = async (taskId, targetColumnId, newOrder) => {
  const res = await api.put(`/tasks/${taskId}/move`, {
    targetColumnId,
    newOrder
  });
  return res;
};

/* ===============================
   UPDATE TASK
=============================== */
export const updateTask = async (taskId, payload) => {
  const res = await api.put(`/tasks/${taskId}`, payload);
  return res;
};

/* ===============================
   CONVERT MESSAGE TO TASK
=============================== */
export const convertMessageToTask = async (messageId) => {
  const res = await api.post(`/messages/${messageId}/convert-to-task`);
  return res;
};