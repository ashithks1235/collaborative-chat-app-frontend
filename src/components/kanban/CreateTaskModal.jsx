import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTask } from "../../api/task.api";
import toast from "react-hot-toast";

export default function CreateTaskModal({
  projectId,
  members = [],
  onClose
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeMembers = useMemo(
    () =>
      members
        .map((member) => member?.user || member)
        .filter((member) => member?._id),
    [members]
  );

  useEffect(() => {
    setTitle("");
    setDescription("");
    setAssignee("");
    setDueDate("");
    setPriority("medium");
    setError("");
  }, []);

  const validate = () => {
    if (!title.trim()) {
      return "Task title is required.";
    }

    if (!assignee) {
      return "Please assign this task to someone.";
    }

    return null;
  };

  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createTask(projectId, {
        title: title.trim(),
        description: description.trim(),
        assignees: [assignee],
        priority,
        dueDate: dueDate || null
      });

      toast.success("Task created");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold">
            Create Task
          </h2>

          <div>
            <label className="text-sm font-medium">
              Task Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task"
              rows={4}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Assign To
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select member</option>
              {safeMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg border"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="text-sm px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
