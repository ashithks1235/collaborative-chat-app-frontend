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
    const fetchBoard = async () => {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setColumns(res.data.data);
    };

    if (projectId) fetchBoard();
  }, [projectId]);

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit("join:project", projectId);

    return () => {
      socket.emit("leave:project", projectId);
    };
  }, [projectId, socket]);

  return (
    <KanbanBoard
      projectId={projectId}
      columns={columns}
      setColumns={setColumns}
    />
  );
}