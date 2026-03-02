import { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay
} from "@dnd-kit/core";
import { getProjectBoard, moveTask } from "../../api/task.api";
import { useSocketContext } from "../../context/SocketContext";
import Column from "./Column";
import TaskDetailModal from "./TaskDetailModal";
import TaskEditDrawer from "./TaskEditDrawer";

export default function KanbanBoard({ projectId }) {
  const { socket } = useSocketContext();

  const [columns, setColumns] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  /* ================= FETCH BOARD ================= */
  useEffect(() => {
    if (!projectId) return;

    const fetchBoard = async () => {
      try {
        const data = await getProjectBoard(projectId);
        setColumns(data || []);
      } catch (err) {
        console.error("Failed to load project board");
      }
    };

    fetchBoard();
  }, [projectId]);

  /* ================= SOCKET ROOM ================= */
  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit("join:project", projectId);

    return () => {
      socket.emit("leave:project", projectId);
    };
  }, [socket, projectId]);

  /* ================= REALTIME ================= */
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (task) => {
      setColumns(prev => {
        const updated = structuredClone(prev);
        const col = updated.find(c => c._id === task.column);
        if (col) col.tasks.push(task);
        return updated;
      });
    };

    const handleMoved = (task) => {
      setColumns(prev => {
        const updated = structuredClone(prev);

        // Remove task from all columns
        updated.forEach(c => {
          c.tasks = c.tasks.filter(t => t._id !== task._id);
        });

        // Find target column
        const newCol = updated.find(c => c._id === task.column);
        if (!newCol) return prev;

        // Insert safely
        newCol.tasks.push(task);

        // Sort column by order (important)
        newCol.tasks.sort((a, b) => a.order - b.order);

        return updated;
      });
    };

    const handleDeleted = (taskId) => {
      setColumns(prev =>
        prev.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => t._id !== taskId)
        }))
      );
    };

    socket.on("task:created", handleCreated);
    socket.on("task:moved", handleMoved);
    socket.on("task:deleted", handleDeleted);

    return () => {
      socket.off("task:created", handleCreated);
      socket.off("task:moved", handleMoved);
      socket.off("task:deleted", handleDeleted);
    };
  }, [socket]);

  /* ================= DRAG START ================= */
  const handleDragStart = (event) => {
    const { active } = event;
    const taskId = active.id;

    for (const col of columns) {
      const found = col.tasks.find(t => t._id === taskId);
      if (found) {
        setActiveTask(found);
        break;
      }
    }
  };

  /* ================= SAFE DRAG HANDLER ================= */
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const sourceColumnId = active.data.current?.columnId;
    if (!sourceColumnId) return;

    let targetColumnId =
      over.data?.current?.columnId || over.id;

    if (!targetColumnId) return;

    const sourceColumn = columns.find(c => c._id === sourceColumnId);
    const targetColumn = columns.find(c => c._id === targetColumnId);
    const orderedColumns = [...columns].sort((a, b) => a.order - b.order);

      const sourceIndex = orderedColumns.findIndex(
        c => c._id === sourceColumnId
      );

      const targetIndex = orderedColumns.findIndex(
        c => c._id === targetColumnId
      );

      if (targetIndex - sourceIndex > 1) {
        return;
      }
    if (!sourceColumn || !targetColumn) return;

    let newIndex;
    const overIndex = targetColumn.tasks.findIndex(t => t._id === over.id);

    if (overIndex !== -1) {
      newIndex = overIndex;
    } else {
      newIndex = targetColumn.tasks.length;
    }

    /* -------- Optimistic Update -------- */
    setColumns(prev => {
      const updated = structuredClone(prev);

      const source = updated.find(c => c._id === sourceColumnId);
      const target = updated.find(c => c._id === targetColumnId);

      if (!source || !target) return prev;

      const taskIndex = source.tasks.findIndex(t => t._id === taskId);
      if (taskIndex === -1) return prev;

      const [task] = source.tasks.splice(taskIndex, 1);

      task.column = targetColumnId;
      task.order = newIndex;
      target.tasks.splice(newIndex, 0, task);

      return updated;
    });

    /* -------- Backend Sync -------- */
    try {
      await moveTask(taskId, targetColumnId, newIndex);
    } catch (err) {
      console.error("Failed to move task");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">

      <div className="flex-1 overflow-x-auto px-2 py-8">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 w-max">
            {columns.map(column => (
              <Column
                key={column._id}
                column={column}
                onOpenTask={setSelectedTask}
              />
            ))}
          </div>

          {/* ================= DRAG OVERLAY ================= */}
          <DragOverlay>
            {activeTask ? (
              <div
                className="
                  w-72
                  bg-white dark:bg-gray-900
                  rounded-2xl
                  p-5
                  shadow-2xl
                  scale-105
                  opacity-95
                  transition-all
                "
              >
                <p className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {activeTask.title}
                </p>
              </div>
            ) : null}
          </DragOverlay>

        </DndContext>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => setShowEdit(true)}
        />
      )}

      {showEdit && selectedTask && (
        <TaskEditDrawer
          task={selectedTask}
          onClose={() => setShowEdit(false)}
          onSaved={(updatedTask) => {
            setColumns(prev =>
              prev.map(col => ({
                ...col,
                tasks: col.tasks.map(t =>
                  t._id === updatedTask._id ? updatedTask : t
                )
              }))
            );
          }}
        />
      )}
    </div>
  );
}