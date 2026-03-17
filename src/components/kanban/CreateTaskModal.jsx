import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTask } from "../../api/task.api";
import toast from "react-hot-toast";

export default function CreateTaskModal({
  projectId,
  columnId,
  members = [],
  onClose
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const toggleAssignee = (userId) => {
    setAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Task title required");
      return;
    }

    if (assignees.length === 0) {
      toast.error("Assign at least one member");
      return;
    }

    try {
      setLoading(true);

      await createTask(projectId, {
        title,
        description,
        column: columnId,
        assignees,
        priority,
        dueDate
      });

      toast.success("Task created");
      onClose();

    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-xl"
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.92 }}
        >
          <h2 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-100">
            Create Task
          </h2>

          {/* TITLE */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          {/* DESCRIPTION */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          {/* ASSIGNEES */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              Assign Members
            </p>

            {/* SEARCH INPUT */}
            <input
              placeholder="Search members..."
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* SELECTED MEMBERS */}
            <div className="flex flex-wrap gap-2 mb-3">
              {assignees.map(id => {
                const user = members.find(m => m._id === id);
                if (!user) return null;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs"
                  >
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.name}`
                      }
                      className="w-5 h-5 rounded-full"
                    />
                    {user.name}

                    <button
                      onClick={() => toggleAssignee(id)}
                      className="ml-1 text-white/80 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* MEMBER LIST */}
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {members
                .filter(m =>
                  m.name.toLowerCase().includes(search.toLowerCase())
                )
                .map(member => (
                  <div
                    key={member._id}
                    onClick={() => toggleAssignee(member._id)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <img
                      src={
                        member.avatar ||
                        `https://ui-avatars.com/api/?name=${member.name}`
                      }
                      className="w-7 h-7 rounded-full"
                    />

                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {member.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* PRIORITY + DATE */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}