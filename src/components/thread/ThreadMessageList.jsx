import { useAuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

export default function ThreadMessageList({
  replies,
  setReplies,
  firstUnreadId,
  isChannelAdmin,
  setEditingReply,
  onConvert
}) {

  const { user } = useAuthContext();
  const unreadRef = useRef(null);
  const { showToast } = useToast();


const deleteReply = async (messageId) => {
  try {
    await api.delete(`/messages/${messageId}`);
    setReplies(prev =>
      prev.filter(r => r._id !== messageId)
    );
    showToast("Reply deleted", "success");
  } catch (err) {
    console.error(err);
    showToast("Failed to delete reply", "error");
  }
};

  useEffect(() => {
    unreadRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [replies]);

  return (
    <div className="px-5 py-6">

      <AnimatePresence>

        {replies.map(reply => {

          const isSender =
            reply.sender?._id === user?._id;

          const unread =
            firstUnreadId === reply._id;

          return (
            <motion.div
              key={reply._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex mb-4 group ${
                isSender ? "justify-end" : "justify-start"
              }`}
              ref={unread ? unreadRef : null}
            >

              <div className="flex gap-3 max-w-[75%] relative mt-2">

                {!isSender && (
                  <img
                    src={
                      reply.sender?.avatar ||
                      `https://ui-avatars.com/api/?name=${reply.sender?.name}`
                    }
                    className="w-7 h-7 rounded-full mt-1"
                  />
                )}

                <div>

                  <div
                    className={`px-4 py-3 rounded-xl shadow
                    ${
                      isSender
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    }`}
                  >

                    {!isSender && (
                      <div className="text-xs font-semibold mb-1">
                        {reply.sender?.name}
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-wrap">
                      {reply.text}
                    </p>

                    {/* ================= HOVER ACTION BAR ================= */}

                    {!reply.isDeleted && (
                      <div
                        className="absolute -top-7 right-10
                        opacity-0 group-hover:opacity-100
                        transition-all duration-200
                        flex items-center gap-2
                        bg-white dark:bg-gray-800 shadow-lg
                        border rounded-lg px-2 py-1 text-xs z-20"
                      >

                        {/* Convert */}
                        {isChannelAdmin && !reply.convertedToTask && (
                          <button
                            onClick={() => onConvert?.(reply)}
                            className="hover:text-blue-600 transition"
                          >
                            💡
                          </button>
                        )}

                        {/* Edit */}
                        {reply.sender?._id === user?._id && (
                          <button
                            onClick={() =>
                              setEditingReply({
                                id: reply._id,
                                text: reply.text
                              })
                            }
                            className="hover:text-green-600 transition"
                          >
                            ✏️
                          </button>
                        )}

                        {/* Delete */}
                        {reply.sender?._id === user?._id && (
                          <button
                            onClick={() => deleteReply(reply._id)}
                            className="hover:text-red-600 transition"
                          >
                            🗑
                          </button>
                        )}

                      </div>
                    )}

                  </div>

                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(reply.createdAt).toLocaleTimeString()}
                  </div>

                  {unread && (
                    <div className="text-[10px] text-red-500 mt-1">
                      New replies below
                    </div>
                  )}

                </div>

                {isSender && (
                  <img
                    src={
                      reply.sender?.avatar ||
                      `https://ui-avatars.com/api/?name=${reply.sender?.name}`
                    }
                    className="w-7 h-7 rounded-full mt-1"
                  />
                )}

              </div>

            </motion.div>
          );

        })}

      </AnimatePresence>

    </div>
  );
}