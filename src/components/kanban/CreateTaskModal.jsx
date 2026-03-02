import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTask } from "../../api/task.api";
import toast from "react-hot-toast";

export default function CreateTaskModal({ columnId, onClose }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }

    try {
      setLoading(true);
      await createTask({
        title,
        column: columnId,
      });

      toast.success("Task created");
      onClose();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Create New Task
          </h2>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}