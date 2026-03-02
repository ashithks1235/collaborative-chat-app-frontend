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

      onSuccess(res.data.data);
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h3 className="text-lg font-semibold">
            Create Project
          </h3>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            rows={3}
          />

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded-lg border"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}