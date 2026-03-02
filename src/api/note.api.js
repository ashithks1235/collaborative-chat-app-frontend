import api from "./axios";

/* GET ALL NOTES */
export const getNotes = async () => {
  const { data } = await api.get("/notes");
  return data;
};

/* CREATE NOTE */
export const createNote = async (payload) => {
  const { data } = await api.post("/notes", payload);
  return data;
};

/* GET SINGLE NOTE */
export const getNoteById = async (id) => {
  const { data } = await api.get(`/notes/${id}`);
  return data;
};

/* UPDATE NOTE */
export const updateNote = async (id, payload) => {
  const { data } = await api.put(`/notes/${id}`, payload);
  return data;
};

/* DELETE NOTE */
export const deleteNote = async (id) => {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
};
