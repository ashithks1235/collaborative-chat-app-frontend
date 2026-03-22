import { useEffect, useState } from "react";
import { FiEdit2, FiX, FiTrash2, FiCalendar } from "react-icons/fi";
import { format } from "date-fns";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext";
import { useTaskContext } from "../../context/TaskContext";
import { useSocketContext } from "../../context/SocketContext";
import getFileUrl from "../../utils/getFileUrl";

export default function TaskDetailModal({ task, onClose, onEdit }) {
  const { user } = useAuthContext();
  const { setTasks } = useTaskContext();
  const { socket } = useSocketContext();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [canDelete, setCanDelete] = useState(false);

  if (!task) return null;

  /* ================= LOAD COMMENTS ================= */

  useEffect(() => {
    api
      .get(`/tasks/${task._id}/comments`)
      .then((res) => {
        const data = res.data || res || [];

        const unique = [];
        const ids = new Set();

        data.forEach((c) => {
          if (!ids.has(c._id)) {
            ids.add(c._id);
            unique.push(c);
          }
        });

        setComments(unique);
      })
      .catch(() => {
        console.log("Failed to load comments");
        setComments([]);
      });
  }, [task]);

  /* ================= LOAD SUBTASKS ================= */

  useEffect(() => {
    api
      .get(`/tasks/${task._id}/subtasks`)
      .then((res) => {
        setSubtasks(res.data || res || []);
      })
      .catch(() => {
        console.log("Failed to load subtasks");
        setSubtasks([]);
      });
  }, [task]);

  useEffect(() => {
    let mounted = true;

    const resolveDeletePermission = async () => {
      if (!user) {
        if (mounted) setCanDelete(false);
        return;
      }

      if (user.role === "Admin" || user.role === "Moderator") {
        if (mounted) setCanDelete(true);
        return;
      }

      if (!task.channel) {
        if (mounted) setCanDelete(false);
        return;
      }

      try {
        const res = await api.get(`/channels/${task.channel}`);
        const channel = res.data || res;

        const isChannelAdmin = Array.isArray(channel.members) &&
          channel.members.some(
            (member) =>
              String(member.user?._id || member.user) === String(user._id || user.id) &&
              member.role === "admin"
          );

        if (mounted) setCanDelete(isChannelAdmin);
      } catch {
        if (mounted) setCanDelete(false);
      }
    };

    resolveDeletePermission();

    return () => {
      mounted = false;
    };
  }, [task.channel, user]);

  /* ================= REALTIME COMMENTS ================= */

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (c) => {
      if (c.task === task._id) {
        setComments((prev) => {
          const exists = prev.some((x) => x._id === c._id);
          if (exists) return prev;
          return [...prev, c];
        });
      }
    };

    socket.on("taskCommentAdded", handleNewComment);

    return () => socket.off("taskCommentAdded", handleNewComment);
  }, [socket, task]);

  /* ================= REALTIME SUBTASK UPDATE ================= */

  useEffect(() => {
    if (!socket) return;

    const handleSubtaskUpdate = (updated) => {
      if (updated.parentTask === task._id) {
        setSubtasks((prev) =>
          prev.map((s) =>
            s._id === updated._id ? updated : s
          )
        );
      }
    };

    socket.on("subtask:updated", handleSubtaskUpdate);

    return () => socket.off("subtask:updated", handleSubtaskUpdate);
  }, [socket, task]);

  /* ================= SEND COMMENT ================= */

  const send = async () => {
    if (!text.trim()) return;

    try {
      await api.post(`/tasks/${task._id}/comments`, { text });
      setText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  /* ================= CONVERT COMMENT ================= */

  const convertCommentToTask = async (comment) => {
    try {
      await api.post(`/comments/${comment._id}/convert-to-task`, {
        projectId: task.project
      });

      toast.success("Comment converted to subtask");
    } catch {
      toast.error("Failed to convert comment");
    }
  };

  /* ================= TOGGLE SUBTASK ================= */

  const toggleSubtask = async (subtaskId) => {
  try {

    const res = await api.patch(`/subtasks/${subtaskId}/toggle`);

    const updated = res.data || res;

    setSubtasks(prev =>
      prev.map(s =>
        s._id === updated._id ? updated : s
      )
    );

  } catch (err) {
    toast.error("Failed to update subtask");
  }
};

  /* ================= DELETE TASK ================= */

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${task._id}`);

      setTasks((prev) =>
        prev.filter((t) => t._id !== task._id)
      );

      toast.success("Task deleted");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Not authorized");
    }
  };


  const priorityStyles = {
    low: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    high: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex justify-end bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-lg h-full
            bg-white dark:bg-gray-900
            shadow-2xl
            p-8
            overflow-y-auto
            relative
          "
        >
          {/* CLOSE */}
          <FiX
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer text-xl"
          />

          {/* HEADER */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {task.title}
            </h2>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                Status: <b>{task.status}</b>
              </span>

              {task.priority && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[task.priority]}`}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}

              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  {format(new Date(task.dueDate), "PPP")}
                </span>
              )}
            </div>
          </div>

          {/* ASSIGNEES */}
          {task.assignees?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Assignees
              </h3>

              <div className="flex gap-3">
                {task.assignees.map((u) => (
                  <div key={u._id} className="flex items-center gap-2">
                    <img
                      src={
                        getFileUrl(u.avatar) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}`
                      }
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {u.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Description
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {task.description || "No description provided."}
            </div>
          </div>

          {/* ================= SUBTASKS ================= */}

          {subtasks.length > 0 && (
            <div className="mt-6">

              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Subtasks
              </h3>

            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <FiEdit2 size={14} />
              Edit
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            )}
          </div>

          {/* COMMENTS */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Comments
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {Array.isArray(comments) &&
                comments.map((c) => (
                  <div
                    key={`${c._id}-${c.createdAt || ""}`}
                    className="flex gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl"
                  >
                    <img
                      src={
                        getFileUrl(c.user?.avatar) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || "User")}`
                      }
                      alt={c.user?.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />

                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {c.user?.name}
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {c.text}
                      </div>

                      {user?.role === "Moderator" && (
                        <button
                          onClick={() => convertCommentToTask(c)}
                          className="text-xs text-blue-500 mt-2 hover:underline"
                        >
                          Convert to task
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* ADD COMMENT */}
            <div className="flex gap-2 mt-4">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="
                  flex-1 text-sm p-2 rounded-lg border
                  dark:bg-gray-800 dark:border-gray-700 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                placeholder="Write a comment..."
              />

              <button
                onClick={send}
                className="bg-blue-500 text-white px-4 rounded-lg text-sm hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
