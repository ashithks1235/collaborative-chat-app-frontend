import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import api from "../../api/axios";
import getFileUrl from "../../utils/getFileUrl";

function TaskCard({ task, columnId, index, onOpen, refetchTasks }) {

const { user } = useAuthContext();

const isAssigned = task?.assignees?.some(
a => String(a._id) === String(user?._id)
);

const myAssignment = task?.assignees?.find(
a => String(a._id) === String(user?._id)
);

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

const toggleSubtask = async (e, subtaskId) => {
  e.stopPropagation();

  try {

    await api.patch(`/subtasks/${subtaskId}/toggle`);

  } catch (err) {
    console.error("Failed to toggle subtask");
  }
};

const priorityStyle = {
high: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
low: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
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

const subtasks = task?.subtasks || [];

return (


<motion.div
  ref={setNodeRef}
  style={style}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 250 }}
  {...attributes}
  {...listeners}
  onClick={() => onOpen(task)}
  className="
    p-5
    bg-white/70 dark:bg-gray-900/60
    backdrop-blur-md
    rounded-2xl
    cursor-pointer
    transition-all duration-300
    hover:shadow-lg
  "
>

  {/* PRIORITY */}

  {task?.priority && (
    <div className="mb-2">
      <span
        className={`text-[11px] font-medium px-2 py-1 rounded-full ${priorityStyle[task.priority]}`}
      >
        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      </span>
    </div>
  )}

  {/* TITLE */}

  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
    {task?.title}
  </h4>

  {/* PROGRESS BAR */}

  {task?.subtaskCount > 0 && (
    <div className="mt-2">

      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

        <div
          className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${task.progress || 0}%` }}
        />

      </div>

      <div className="flex justify-end text-[10px] text-gray-500 mt-1">
        {task.completedSubtasks || 0}/{task.subtaskCount}
      </div>

    </div>
  )}

  {/* DUE DATE */}

  {task?.dueDate && (
    <div className="mt-2">
      <span
        className={`text-[11px] font-medium px-2 py-1 rounded-full ${dueColor()}`}
      >
        ⏰ {format(new Date(task.dueDate), "MMM d")}
      </span>
    </div>
  )}

  {/* ASSIGNEE */}

  {task?.assignees?.length > 0 && (
    <div className="flex items-center gap-2 mt-3">

      <img
        src={
          getFileUrl(myAssignment?.avatar) ||
          getFileUrl(task.assignees[0]?.avatar) ||
          `https://ui-avatars.com/api/?name=${
            myAssignment?.name || task.assignees[0]?.name
          }`
        }
        alt="assignee"
        className="w-7 h-7 rounded-full object-cover"
      />

      <span className="text-xs text-gray-600 dark:text-gray-300">
        {myAssignment ? "You" : task.assignees[0]?.name}
      </span>

    </div>
  )}

  {/* SUBTASK LIST */}

  {subtasks.length > 0 && (

    <div className="mt-3 space-y-1 max-h-32 overflow-y-auto pr-1">

      {subtasks.map(sub => (

        <div
          key={sub._id}
          className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
        >

          <input
            type="checkbox"
            checked={sub.status === "completed"}
            disabled={!isAssigned}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => toggleSubtask(e, sub._id)}
            className={`cursor-pointer ${!isAssigned ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          <span
            className={
              sub.status === "completed"
                ? "line-through opacity-60"
                : ""
            }
          >
            {sub.title}
          </span>

        </div>

      ))}

    </div>

  )}


</motion.div>

);

}

export default memo(TaskCard);
