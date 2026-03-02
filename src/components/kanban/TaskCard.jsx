import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";
import { FiMessageSquare, FiPaperclip } from "react-icons/fi";
import { useAuthContext } from "../../context/AuthContext";

function TaskCard({ task, columnId, index, onOpen }) {

  const { user } = useAuthContext();

  const isAssigned = task?.assignees?.some(
    a => String(a._id) === String(user?._id)
  );
  /* ===============================
     DND-KIT SORTABLE
  =============================== */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task?._id,
    data: {
      columnId,
      index
    },
    disabled: !isAssigned
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging
      ? "0 15px 35px rgba(0,0,0,0.15)"
      : undefined
  };

  /* ===============================
     UI HELPERS
  =============================== */

  const priorityStyles = {
    low: "from-green-400 to-green-500",
    medium: "from-yellow-400 to-yellow-500",
    high: "from-red-400 to-red-500"
  };

  const dueColor = () => {
    if (!task?.dueDate)
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";

    const diff = new Date(task.dueDate) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 0)
      return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400";
    if (days < 2)
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400";
    return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className="
        group relative
        bg-white dark:bg-gray-900
        rounded-2xl
        p-5
        shadow-sm hover:shadow-xl
        transition-all duration-200
        hover:-translate-y-1
        cursor-pointer
      "
    >
      
      {/* PRIORITY BADGE */}
      {task?.priority && (
        <span
          className={`
            text-[11px] font-semibold
            px-3 py-1 rounded-full
            inline-block mb-3
            ${
              task.priority === "high"
                ? "bg-red-100 text-red-600"
                : task.priority === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-600"
            }
          `}
        >
          {task.priority === "high"
            ? "High Priority"
            : task.priority === "medium"
            ? "Important"
            : "Low Priority"}
        </span>
      )}

      {/* ================= TITLE ================= */}
      <p className="font-semibold text-base text-gray-800 dark:text-gray-100 leading-snug">
        {task?.title}
      </p>

      {/* ================= DUE DATE ================= */}
      {task?.dueDate && (
        <span
          className={`text-[11px] font-medium px-2 py-1 rounded-full mt-3 inline-block ${dueColor()}`}
        >
          ⏰ {format(new Date(task.dueDate), "MMM d")}
        </span>
      )}

      {/* ================= CREATED BY ================= */}
      {task?.createdBy && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="opacity-70">Created by</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {task.createdBy.name}
          </span>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <div className="flex items-center justify-between mt-5">

        {/* ASSIGNEES */}
        <div className="flex -space-x-3">
          {task?.assignees?.slice(0, 3).map((u, i) => (
            <div
              key={u?._id || `assignee-${i}`}
              className="relative group/avatar"
            >
              <img 
                src={
                  u?.avatar ||
                  `https://ui-avatars.com/api/?name=${u?.name}`
                }
                alt={u?.name}
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
              />

              {/* Tooltip */}
              <div
                className="
                  absolute bottom-10 left-1/2 -translate-x-1/2
                  bg-gray-900 text-white text-xs px-2 py-1 rounded
                  opacity-0 group-hover/avatar:opacity-100
                  transition whitespace-nowrap z-50
                "
              >
                {u?.name}
                {u?.role && <span className="ml-1">({u.role})</span>}
              </div>
            </div>
          ))}
        </div>

        {/* META */}
        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
          {!!task?.commentsCount && (
            <span className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition">
              <FiMessageSquare size={14} />
              {task.commentsCount}
            </span>
          )}

          {!!task?.attachmentsCount && (
            <span className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition">
              <FiPaperclip size={14} />
              {task.attachmentsCount}
            </span>
          )}
        </div>
      </div>

      {/* ================= ATTACHMENTS ================= */}
      {task?.attachments?.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs">
          {task.attachments.map((a, i) => (
            <li key={a?.url || `attachment-${i}`}>
              <a
                href={a?.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                📎 {a?.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(TaskCard);