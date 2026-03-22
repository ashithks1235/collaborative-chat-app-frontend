import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useSocketContext } from "../../context/SocketContext";
import KanbanBoard from "../kanban/KanbanBoard";

export default function ProjectBoard() {

  const { projectId } = useParams();
  const { socket } = useSocketContext();

  const [columns, setColumns] = useState([]);

  useEffect(() => {
  if (!socket) return;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

}, [socket]);

  /* ================= FETCH BOARD ================= */

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setColumns(res.data || []);
    } catch (err) {
      console.error("Failed to load board", err);
    }
  };

  useEffect(() => {
    if (projectId) fetchBoard();
  }, [projectId]);

  /* ================= SOCKET REALTIME ================= */

  useEffect(() => {

    if (!socket || !projectId || !socket.connected) return;

    socket.emit("join:project", projectId);
    console.log("Joined project room:", projectId);

    /* ===== SUBTASK UPDATED ===== */

    const handleSubtaskUpdated = (updatedSubtask) => {

      setColumns(prevColumns =>
        prevColumns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => {

            if (String(task._id) !== String(updatedSubtask.parentTask))
              return task;

            const updatedSubtasks = (task.subtasks || []).map(sub => {
              if (String(sub._id) === String(updatedSubtask._id)) {
                return { ...sub, status: updatedSubtask.status };
              }
              return sub;
            });

            const completed = updatedSubtasks.filter(
              s => s.status === "completed"
            ).length;

            const total = updatedSubtasks.length;

            return {
              ...task,
              subtasks: updatedSubtasks,
              completedSubtasks: completed,
              subtaskCount: total,
              progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };

          })
        }))
      );

    };

    socket.on("subtask:updated", handleSubtaskUpdated);
    socket.on("subtask:updated", (data) => {
      console.log("Realtime subtask event:", data);
    });

    /* ===== CLEANUP ===== */

    return () => {
      if (socket?.connected) {
        socket.emit("leave:project", projectId);
      }
      socket.off("subtask:updated", handleSubtaskUpdated);
    };

  }, [socket, projectId, socket?.connected]);

  /* ================= RENDER ================= */

  return (
    <KanbanBoard
      projectId={projectId}
      columns={columns}
      setColumns={setColumns}
      refetchTasks={fetchBoard}
    />
  );

}
