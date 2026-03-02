import { useAuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

export default function ThreadMessageList({
  replies = [],
  onConvertThread,
  onEditThread,
  onDeleteThread,
  isChannelAdmin = false,
  firstUnreadId
}) {
  const { user } = useAuthContext();
  const firstUnreadRef = useRef(null);

  /* ================= DATE LABEL ================= */
  const getDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString();
  };

  /* ================= AUTO SCROLL TO FIRST UNREAD ================= */
  useEffect(() => {
    if (firstUnreadRef.current) {
      firstUnreadRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [replies]);

  let lastDate = null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <AnimatePresence initial={false}>
        {replies.map((reply) => {
          const isSender = reply.sender?._id === user?._id;
          const isUnread = firstUnreadId === reply._id;

          const messageDate = new Date(reply.createdAt).toDateString();
          const showDateSeparator = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <div key={reply._id}>

              {/* ================= DATE SEPARATOR ================= */}
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <div className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1 rounded-full">
                    {getDateLabel(reply.createdAt)}
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
                ref={isUnread ? firstUnreadRef : null}
                className={`group flex mb-4 ${
                  isSender ? "justify-end" : "justify-start"
                }`}
              >
                <div className="relative flex gap-3 max-w-[75%]">

                  {/* LEFT AVATAR */}
                  {!isSender && (
                    <img
                      src={
                        reply.sender?.avatar ||
                        `https://ui-avatars.com/api/?name=${reply.sender?.name}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover mt-1"
                    />
                  )}

                  <div className="flex flex-col">

                    {/* ================= BUBBLE ================= */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-md
                        ${
                          isSender
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-md"
                        }
                      `}
                    >
                      {!isSender && (
                        <div className="mb-1 font-semibold text-sm">
                          {reply.sender?.name}
                        </div>
                      )}

                      <p className="text-sm whitespace-pre-wrap">
                        {reply.text}
                      </p>

                      {/* ================= HOVER ACTION BAR ================= */}
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

                        {/* Convert (Moderator/Admin only) */}
                        {(user?.role === "Moderator" ||
                          user?.role === "Admin") && (
                          <button
                            onClick={() => onConvertThread?.(reply)}
                            className="hover:text-yellow-600 transition"
                          >
                            💡
                          </button>
                        )}

                        {/* Edit (Sender only) */}
                        {isSender && (
                          <button
                            onClick={() => onEditThread?.(reply)}
                            className="hover:text-green-600 transition"
                          >
                            ✏️
                          </button>
                        )}

                        {/* Delete (Sender OR Channel Admin) */}
                        {(isSender || isChannelAdmin) && (
                          <button
                            onClick={() => onDeleteThread?.(reply)}
                            className="hover:text-red-600 transition"
                          >
                            🗑
                          </button>
                        )}

                      </div>
                    </div>

                    {/* ================= TIME BELOW ================= */}
                    <div
                      className={`text-[10px] mt-1 ${
                        isSender
                          ? "text-right text-gray-400"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(reply.createdAt).toLocaleTimeString()}
                      {reply.editedAt && " • edited"}
                    </div>

                    {/* ================= UNREAD MARKER ================= */}
                    {isUnread && (
                      <div className="mt-1 text-[10px] text-red-500 font-medium">
                        New replies below
                      </div>
                    )}
                  </div>

                  {/* RIGHT AVATAR */}
                  {isSender && (
                    <img
                      src={
                        reply.sender?.avatar ||
                        `https://ui-avatars.com/api/?name=${reply.sender?.name}`
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
    </div>
  );
}