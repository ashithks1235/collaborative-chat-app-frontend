import { useState } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { updateTask } from "../../api/task.api";
import toast from "react-hot-toast";

export default function TaskEditDrawer({ task, onClose, onSaved }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const updated = await updateTask(task._id, {
        title: title.trim(),
        description: description.trim(),
        priority
      });

      toast.success("Task updated");
      onSaved?.(updated);
      onClose();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const priorityStyles = {
    low: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    high: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
  };

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* DRAWER */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="
          fixed right-0 top-0 h-full w-full max-w-md
          bg-white dark:bg-gray-900
          shadow-2xl z-50
          p-8
          flex flex-col
        "
      >
        {/* CLOSE */}
        <FiX
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer text-xl"
          onClick={onClose}
        />

        {/* HEADER */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Edit Task
        </h2>

        {/* TITLE */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              mt-2 w-full p-3 rounded-xl border
              bg-gray-50 dark:bg-gray-800
              border-gray-200 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              text-sm
            "
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="
              mt-2 w-full p-3 rounded-xl border
              bg-gray-50 dark:bg-gray-800
              border-gray-200 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              text-sm resize-none
            "
          />
        </div>

        {/* PRIORITY */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Priority
          </label>

          <div className="flex gap-3 mt-3">
            {["low", "medium", "high"].map((level) => (
              <button
                key={level}
                onClick={() => setPriority(level)}
                className={`
                  px-4 py-2 rounded-full text-xs font-medium transition
                  ${priority === level
                    ? priorityStyles[level]
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"}
                `}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-auto flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 py-3 rounded-xl border
              text-sm font-medium
              dark:border-gray-700
            "
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={loading}
            className="
              flex-1 py-3 rounded-xl
              bg-blue-600 text-white
              text-sm font-medium
              hover:bg-blue-700 transition
              disabled:opacity-50
            "
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}