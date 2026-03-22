import { useAuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { MdAddTask, MdDelete, MdEdit } from "react-icons/md";
import getFileUrl from "../../utils/getFileUrl";

function HoverIconButton({ label, className, onClick, children }) {
  return (
    <div className="group/icon relative flex">
      <div className="pointer-events-none absolute -top-11 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center opacity-0 transition duration-150 group-hover/icon:-translate-y-1 group-hover/icon:opacity-100">
        <span className="whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-white shadow-lg ring-1 ring-black/10 dark:bg-gray-700 dark:ring-white/10">
          {label}
        </span>
        <span className="h-2 w-2 -translate-y-1 rotate-45 bg-gray-900 shadow-sm dark:bg-gray-700" />
      </div>
      <button
        onClick={onClick}
        className={className}
        aria-label={label}
        type="button"
      >
        {children}
      </button>
    </div>
  );
}

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
                      getFileUrl(reply.sender?.avatar) ||
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
                        className={`absolute -top-7 ${
                          isSender ? "right-10" : "left-10"
                        } opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200
                        flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border
                        rounded-lg px-2 py-1 text-xs z-20`}
                      >

                        {isChannelAdmin && !reply.convertedToTask && (
                          <HoverIconButton
                            label="Convert to task"
                            onClick={() => onConvert?.(reply)}
                            className="text-green-600 transition hover:text-green-500"
                          >
                            <MdAddTask size={14} />
                          </HoverIconButton>
                        )}

                        {reply.sender?._id === user?._id && (
                          <HoverIconButton
                            label="Edit reply"
                            onClick={() =>
                              setEditingReply({
                                id: reply._id,
                                text: reply.text
                              })
                            }
                            className="text-yellow-600 transition hover:text-yellow-500"
                          >
                            <MdEdit size={14} />
                          </HoverIconButton>
                        )}

                        {reply.sender?._id === user?._id && (
                          <HoverIconButton
                            label="Delete reply"
                            onClick={() => deleteReply(reply._id)}
                            className="text-red-700 transition hover:text-red-600"
                          >
                            <MdDelete size={14} />
                          </HoverIconButton>
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
                      getFileUrl(reply.sender?.avatar) ||
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
