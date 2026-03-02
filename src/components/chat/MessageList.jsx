import { useAuthContext } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageList({
  messages,
  channelId,
  readOnly = false,
  isChannelAdmin = false,
  onDelete,
  onReact,
  onConvert,
  onPin,
  recentlyConvertedId,
  onEdit,
  onOpenThread,
}) {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= TYPING LISTENER ================= */
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userName, channelId: chId }) => {
      if (chId !== channelId) return;
      setTypingUsers(prev =>
        prev.includes(userName) ? prev : [...prev, userName]
      );
    };

    const handleStopTyping = ({ userName, channelId: chId }) => {
      if (chId !== channelId) return;
      setTypingUsers(prev =>
        prev.filter(name => name !== userName)
      );
    };

    socket.on("typing:start", handleTyping);
    socket.on("typing:stop", handleStopTyping);

    return () => {
      socket.off("typing:start", handleTyping);
      socket.off("typing:stop", handleStopTyping);
    };
  }, [socket, channelId]);

  /* ================= DATE HELPERS ================= */
  const getDateLabel = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Today";
    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return msgDate.toLocaleDateString();
  };

  let lastDate = null;

  /* ================= MENTION HIGHLIGHT ================= */
  const highlightMentions = (text) => {
    if (!text) return null;

    return text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-blue-600 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">

      <AnimatePresence initial={false}>
        {messages.map((m, index) => {
          const isSender = user?._id === m.sender?._id;
          const messageDate = new Date(m.createdAt).toDateString();
          const showDateSeparator = messageDate !== lastDate;
          lastDate = messageDate;

          const canConvert =
            (user?.role === "Moderator" || isChannelAdmin) &&
            !m.convertedToTask &&
            !readOnly;

          const isRecentlyConverted = recentlyConvertedId === m._id;

          return (
            <div key={m._id}>

              {/* ================= DATE SEPARATOR ================= */}
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <div className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1 rounded-full">
                    {getDateLabel(m.createdAt)}
                  </div>
                </div>
              )}

              {/* ================= MESSAGE ROW ================= */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`group flex mb-4 ${
                  isSender ? "justify-end" : "justify-start"
                }`}
              >
                <div className="relative flex gap-3 max-w-[70%]">

                  {/* LEFT AVATAR */}
                  {!isSender && (
                    <img
                      src={
                        m.sender?.avatar ||
                        `https://ui-avatars.com/api/?name=${m.sender?.name}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover mt-1"
                    />
                  )}

                  <div className="flex flex-col">

                    {/* ================= MESSAGE BUBBLE ================= */}
                    <motion.div
                      layout
                      animate={
                        isRecentlyConverted
                          ? { boxShadow: "0 0 0 3px #86efac" }
                          : { boxShadow: "0 0 0 0px transparent" }
                      }
                      transition={{ duration: 0.4 }}
                      className={`relative px-4 py-3 rounded-2xl shadow-md
                        ${
                          isSender
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-md"
                        }
                        ${m.optimistic ? "opacity-60" : ""}
                      `}
                    >
                      {!isSender && (
                        <div className="mb-1 font-semibold text-sm">
                          {m.sender?.name}
                        </div>
                      )}

                      <p
                        className={`text-sm whitespace-pre-wrap ${
                          m.isDeleted ? "italic text-gray-400" : ""
                        }`}
                      >
                        {highlightMentions(m.text)}
                      </p>

                      {/* ================= HOVER ACTION BAR ================= */}
                      {!readOnly && !m.isDeleted && (
                        <div
                          className={`absolute -top-3 ${
                            isSender ? "right-2" : "left-2"
                          }
                          opacity-0 group-hover:opacity-100
                          transition-all duration-200
                          flex items-center gap-2
                          bg-white dark:bg-gray-800 shadow-lg
                          border rounded-lg px-2 py-1 text-xs z-20`}
                        >
                          <button
                            onClick={() => onReact?.(m._id, "👍")}
                            className="hover:text-yellow-600 transition"
                          >
                            👍
                          </button>

                          <button
                            onClick={() => onOpenThread?.(m)}
                            className="hover:text-purple-600 transition"
                          >
                            💬
                          </button>

                          {isChannelAdmin && (
                            <button
                              onClick={() => onPin?.(m._id)}
                              className="hover:text-yellow-600 transition"
                            >
                              📌
                            </button>
                          )}

                          {canConvert && (
                            <button
                              onClick={() => onConvert?.(m)}
                              className="hover:text-blue-600 transition"
                            >
                              💡
                            </button>
                          )}

                          {isSender && (
                            <button
                              onClick={() => onEdit?.(m)}
                              className="hover:text-green-600 transition"
                            >
                              ✏️
                            </button>
                          )}

                          {(isSender || isChannelAdmin) && (
                            <button
                              onClick={() => onDelete?.(m._id)}
                              className="hover:text-red-600 transition"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>

                    {m.replyCount > 0 && (
                      <button
                        onClick={() => onOpenThread?.(m)}
                        className="text-xs text-purple-600 mt-2 hover:underline"
                      >
                        View thread ({m.replyCount} replies)
                      </button>
                    )}

                    {m.replyCount > 0 && (
                      <div
                        onClick={() => onOpenThread?.(m)}
                        className="mt-2 cursor-pointer"
                      >
                        <div className="text-xs text-purple-600 font-medium hover:underline">
                          💬 {m.replyCount} new {m.replyCount === 1 ? "reply" : "replies"}
                        </div>

                        {m.lastReply && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            <span className="font-semibold">
                              {m.lastReply.sender?.name}:
                            </span>{" "}
                            {m.lastReply.text}
                          </div>
                        )}
                      </div>
                    )}


                    {/* ================= REACTIONS (LAYERED BELOW BUBBLE) ================= */}
                    {!m.isDeleted && m.reactions?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {m.reactions.map((r) => (
                          <motion.button
                            key={r.emoji}
                            whileTap={{ scale: 0.9 }}
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"
                            onClick={() => onReact?.(m._id, r.emoji)}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.users.length}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* ================= TIME BELOW BUBBLE ================= */}
                    {!m.isDeleted && (
                      <div
                        className={`text-[10px] mt-1 ${
                          isSender
                            ? "text-right text-gray-400"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleTimeString()}
                        {m.editedAt && " • edited"}
                      </div>
                    )}

                  </div>

                  {/* RIGHT AVATAR */}
                  {isSender && (
                    <img
                      src={
                        m.sender?.avatar ||
                        `https://ui-avatars.com/api/?name=${m.sender?.name}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover mt-1"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>

      {/* ================= TYPING INDICATOR ================= */}
      {typingUsers.length > 0 && (
        <div className="text-xs text-gray-500 italic mt-4">
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.length} people are typing...`}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}