import { useState } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateProjectModal({
  channelId,
  onClose,
  onSuccess
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 3) {
      setError("Project name must be at least 3 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/projects", {
        name,
        description,
        channelId
      });

      onSuccess(res.data || res);
    } catch (err) {
      setError("Failed to create project");
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
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create Project
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a new project space for tasks, updates, and planning.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                Project Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
