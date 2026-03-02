import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useSocketContext } from "./SocketContext";
import { useAuthContext } from "./AuthContext"; // 🔥 NEW

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const {socket} = useSocketContext();
  const { authReady, user } = useAuthContext(); // 🔥 NEW

  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const loadTasks = async () => {
    const res = await api.get("/tasks/my");
    setTasks(res.data);
  };

  // 🔐 WAIT FOR AUTH
  useEffect(() => {
    if (!authReady || !user) return;
    loadTasks();
  }, [authReady, user]);

  useEffect(() => {
    if (!socket) return;

    const onCreated = (task) => setTasks((prev) => [task, ...prev]);
    const onUpdated = (updated) =>
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

    socket.on("taskCreated", onCreated);
    socket.on("taskUpdated", onUpdated);

    return () => {
      socket.off("taskCreated", onCreated);
      socket.off("taskUpdated", onUpdated);
    };
  }, [socket]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks, loadTasks, addTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => useContext(TaskContext);
