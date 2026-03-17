import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import { useAuthContext } from "../../context/AuthContext";
import CreateTaskModal from "./CreateTaskModal";

function Column({ column, projectId, members, onOpenTask, refetchTasks }) {
  if (!column) return null;

  const tasks = column.tasks || [];

  const { user } = useAuthContext();
  const [showCreate, setShowCreate] = useState(false);

  const isModerator =
    user?.role?.toLowerCase() === "moderator";

  const isTodo =
    column.title?.toLowerCase() === "todo";

  const dotColors = {
    "todo": "bg-blue-500",
    "in progress": "bg-orange-500",
    "completed": "bg-green-500"
  };

  const formatTitle = (title) =>
    title
      ?.split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  /* ================= DROPPABLE COLUMN ================= */
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      columnId: column._id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-full min-w-0
       bg-white dark:bg-gray-900
        rounded-xl
        shadow-sm border border-gray-200 dark:border-gray-800
        flex flex-col h-full self-start
        transition-all duration-200 ease-out
        ${isOver ? "ring-2 ring-blue-400 scale-[1.02]" : ""}
      `}
    >

      {/* HEADER */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${
              dotColors[column.title?.toLowerCase()] || "bg-gray-400"
            }`}
          />
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
            {formatTitle(column.title)}
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* ADD TASK BUTTON */}
      {isTodo && isModerator && (
        <div className="px-4 mt-2">
          <button
            onClick={() => setShowCreate(true)}
            className="
              w-full py-2 text-sm font-medium
              rounded-xl
              bg-blue-500 text-white
              hover:bg-blue-600
              transition-all duration-200
            "
          >
            + Add New Task
          </button>
        </div>
      )}

      {/* TASK LIST */}
      <SortableContext
        items={tasks.map(task => task._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-4 space-y-3 px-1 pb-4 h-full max-h-[calc(100vh-320px)] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {tasks.length === 0 ? (
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-8">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={{ ...task, columnTitle: column.title }}
                columnId={column._id}
                index={index}
                onOpen={onOpenTask}
                refetchTasks={refetchTasks}
              />
            ))
          )}
        </div>
      </SortableContext>

      {showCreate && (
        <CreateTaskModal
          projectId={projectId}
          columnId={column._id}
          members={members}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

export default memo(Column);