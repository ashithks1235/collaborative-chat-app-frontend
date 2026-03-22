import { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { getProjectBoard, moveTask } from "../../api/task.api";
import { useSocketContext } from "../../context/SocketContext";
import Column from "./Column";
import TaskDetailModal from "./TaskDetailModal";
import TaskEditDrawer from "./TaskEditDrawer";
import { useTaskContext } from "../../context/TaskContext";
import api from "../../api/axios";
import getFileUrl from "../../utils/getFileUrl";

export default function KanbanBoard({ projectId, search = "", groupBy = "status" , refetchTasks}) {
  const { socket } = useSocketContext();
  const { setTasks } = useTaskContext();

  const [columns, setColumns] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [members, setMembers] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    })
  );

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

  /* ================= FETCH PROJECT MEMBERS ================= */

  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        const payload = res?.data ?? res;
        const project = payload?.project || payload?.data?.project || null;
        const channelId = project?.channel?._id || project?.channel;

        if (!channelId) {
          setMembers([]);
          return;
        }

        const channelRes = await api.get(`/channels/${channelId}`);
        const channelPayload = channelRes?.data ?? channelRes;
        const channelMembers = Array.isArray(channelPayload?.members)
          ? channelPayload.members
              .map((member) => member?.user || member)
              .filter((member) => member?._id)
          : [];

        setMembers(channelMembers);
      } catch (err) {
        console.error("Failed to load channel members for task creation");
        setMembers([]);
      }
    };

    fetchMembers();
  }, [projectId]);

  const filteredColumns = columns.map(col => {

  let tasks = [...(col.tasks || [])]; // clone tasks safely

  /* ===== SEARCH FILTER ===== */
  if (search && search.trim() !== "") {
    tasks = tasks.filter(task =>
      task.title?.toLowerCase().includes(search.toLowerCase())
    );
  }

  /* ===== GROUP BY ASSIGNEE ===== */
  if (groupBy === "assignee") {
    tasks = [...tasks].sort((a, b) => {
      const aName = a.assignees?.[0]?.name || "";
      const bName = b.assignees?.[0]?.name || "";
      return aName.localeCompare(bName);
    });
  }

  /* ===== GROUP BY PRIORITY ===== */
  if (groupBy === "priority") {
    const order = { high: 1, medium: 2, low: 3 };

    tasks = [...tasks].sort(
      (a, b) => (order[a.priority] || 4) - (order[b.priority] || 4)
    );
  }

  return {
    ...col,
    tasks
  };

});

  /* ================= SYNC TASKS TO CONTEXT ================= */

    useEffect(() => {

  const allTasks = columns.flatMap(col =>
    (col.tasks || []).map(task => ({
      ...task,
      status: col.title.toLowerCase() // derive status from column
    }))
  );

  setTasks(allTasks);

}, [columns, setTasks]);


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

    /* ===== COMMENT ADDED ===== */

    const handleCommentAdded = (comment) => {

      setColumns(prev => {

        const updated = structuredClone(prev);

        updated.forEach(col => {

          const task = col.tasks.find(t => t._id === comment.task);

          if (task) {
            task.commentsCount = (task.commentsCount || 0) + 1;

            if (!task.commentUsers) task.commentUsers = [];

            if (!task.commentUsers.includes(comment.user._id)) {
              task.commentUsers.push(comment.user._id);
            }
          }

        });

        return updated;
      });

    };

    /* ===== TASK CREATED ===== */

    const handleCreated = (task) => {

      setColumns(prev => {

        const updated = structuredClone(prev);

        const column = updated.find(
          c => c._id.toString() === task.column.toString()
        );

        if (!column) return prev;

        column.tasks = [...column.tasks, task];

        column.tasks.sort((a, b) => a.order - b.order);

        return updated;

      });

    };

    /* ===== TASK MOVED ===== */

    const handleMoved = (task) => {
      setColumns(prev => {
        const updated = structuredClone(prev);

        updated.forEach(c => {
          c.tasks = c.tasks.filter(t => t._id.toString() !== task._id.toString());
        });

        const newCol = updated.find(
          c => c._id.toString() === task.column.toString()
        );
        if (!newCol) return prev;

        newCol.tasks.push(task);
        newCol.tasks.sort((a, b) => a.order - b.order);

        return updated;
      });
    };

    const handleUpdated = (task) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((currentTask) =>
            currentTask._id === task._id
              ? { ...currentTask, ...task }
              : currentTask
          )
        }))
      );

      setSelectedTask((prev) =>
        prev && prev._id === task._id
          ? { ...prev, ...task }
          : prev
      );
    };

    /* ===== TASK DELETED ===== */

    const handleDeleted = (taskId) => {
      setColumns(prev =>
        prev.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => t._id !== taskId)
        }))
      );
    };

    /* ===== SUBTASK UPDATED ===== */

    const handleSubtaskCreated = (subtask) => {
      setColumns(prev => {
        const updated = structuredClone(prev);
        updated.forEach(col => {
          col.tasks.forEach(task => {
            if (task._id === subtask.parentTask) {
              // increase total count
              task.subtaskCount = (task.subtaskCount || 0) + 1;
              // ensure array exists
              if (!task.subtasks) {
                task.subtasks = [];
              }
              // add newest subtask
              task.subtasks.unshift({
                _id: subtask._id,
                title: subtask.title,
                status: subtask.status || "todo",
                parentTask: subtask.parentTask
              });
              // update progress
              if (!task.completedSubtasks) {
                task.completedSubtasks = 0;
              }
              task.progress = Math.round(
                (task.completedSubtasks / task.subtaskCount) * 100
              );
            }
          });
        });
        return updated;
      });
    };

    const handleSubtaskUpdated = (updatedSubtask) => {
      setColumns(prev => {
        const updated = structuredClone(prev);
        updated.forEach(col => {
          col.tasks.forEach(task => {
            if (task._id === updatedSubtask.parentTask) {
              /* ===== UPDATE SUBTASK STATUS ===== */
              if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks = task.subtasks.map(sub =>
                  sub._id === updatedSubtask._id
                    ? { ...sub, status: updatedSubtask.status }
                    : sub
                );
              }
              /* ===== UPDATE PROGRESS ===== */
              if (updatedSubtask.status === "completed") {
                task.completedSubtasks =
                  (task.completedSubtasks || 0) + 1;
              } else {
                task.completedSubtasks =
                  Math.max((task.completedSubtasks || 1) - 1, 0);
              }
              if (task.subtaskCount > 0) {
                task.progress = Math.round(
                  (task.completedSubtasks / task.subtaskCount) * 100
                );
              }
            }
          });
        });
        return updated;
      });
    };

    socket.on("task:created", handleCreated);
    socket.on("task:moved", handleMoved);
    socket.on("task:updated", handleUpdated);
    socket.on("task:deleted", handleDeleted);
    socket.on("taskCommentAdded", handleCommentAdded);
    socket.on("subtask:created", handleSubtaskCreated);
    socket.on("subtask:updated", handleSubtaskUpdated);

    return () => {
      socket.off("task:created", handleCreated);
      socket.off("task:moved", handleMoved);
      socket.off("task:updated", handleUpdated);
      socket.off("task:deleted", handleDeleted);
      socket.off("taskCommentAdded", handleCommentAdded);
      socket.off("subtask:created", handleSubtaskCreated);
      socket.off("subtask:updated", handleSubtaskUpdated);
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

  /* ================= DRAG END ================= */

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

    /* ===== Optimistic Update ===== */

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

    /* ===== Backend Sync ===== */

    try {
      await moveTask(taskId, targetColumnId, newIndex);
    } catch (err) {
      console.error("Failed to move task");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      <div className="flex-1 px-4 py-6 overflow-hidden">

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredColumns.map(column => (
              <Column
                key={column._id}
                column={column}
                projectId={projectId}
                members={members}
                onOpenTask={setSelectedTask}
                refetchTasks={refetchTasks}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div
                className="
                  w-full max-w-sm
                  bg-white dark:bg-gray-900
                  rounded-xl
                  p-4
                  shadow-2xl
                  scale-105
                  opacity-95
                  border
                "
              >
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  {activeTask.title}
                </p>

                {activeTask?.assignees?.[0] && (
                  <div className="flex items-center gap-2 mt-3">
                    <img
                      src={
                        getFileUrl(activeTask.assignees[0]?.avatar) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          activeTask.assignees[0]?.name || "User"
                        )}`
                      }
                      alt="assignee"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {activeTask.assignees[0]?.name}
                    </span>
                  </div>
                )}
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
          key={selectedTask._id}
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
            setSelectedTask(updatedTask);
          }}
        />
      )}

    </div>
  );
}
