import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import getErrorMessage from "../../utils/getErrorMessage";
import { useToast } from "../../context/ToastContext";

export default function ConvertToTaskModal({
  isOpen,
  onClose,
  message,
  channelMembers = [],
  projects = [],
  onSuccess,
}) {
  const { showToast } = useToast();

  const [projectId, setProjectId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===========================
     RESET WHEN OPENED
  =========================== */
  useEffect(() => {
    if (isOpen) {
      setProjectId("");
      setAssignee("");
      setDueDate("");
      setPriority("medium");
      setError("");
    }
  }, [isOpen]);

  /* ===========================
     VALIDATION
  =========================== */
  const validate = () => {
    if (!projectId) {
      return "Please select a project.";
    }

    if (!assignee) {
      return "Please assign this task to someone.";
    }

    return null;
  };

  /* ===========================
     SUBMIT
  =========================== */
  const handleConvert = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        `/messages/${message._id}/convert-to-task`,
        {
          projectId,                   
          assignees: [assignee],        
          dueDate: dueDate || null,
          priority,
        }
      );

      showToast("Task created successfully");

      onSuccess?.(res.data || res);
      onClose();

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          {/* HEADER */}
          <h2 className="text-lg font-semibold">
            Convert Message to Task
          </h2>

          {/* MESSAGE PREVIEW */}
          <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-h-28 overflow-y-auto">
            {message?.text}
          </div>

          {/* PROJECT SELECT */}
          <div>
            <label className="text-sm font-medium">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ASSIGNEE */}
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
              {channelMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* DUE DATE */}
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

          {/* PRIORITY */}
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

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg border"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleConvert}
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