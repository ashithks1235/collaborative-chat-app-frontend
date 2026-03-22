import { useAuthContext } from "../../context/AuthContext";
import { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import MessageRenderer from "./messages/MessageRenderer";
import getFileUrl from "../../utils/getFileUrl";

export default function MessageList({
  messages,
  highlightId,
  highlightTrigger,
  readOnly = false,
  isChannelAdmin = false,
  onDelete,
  onReact,
  onConvert,
  onPin,
  recentlyConvertedId,
  onEdit,
  onOpenThread,
  onReply,
  onJumpToMessage
}) {
  const { user } = useAuthContext();

  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const messageRefs = useRef({});

  const [activeHighlight, setActiveHighlight] = useState(null);
  const highlightTimeoutRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (!messages.length) return;
    if (activeHighlight) return;

    const lastMessage = messages[messages.length - 1];

    const senderId =
      lastMessage.sender?._id ||
      lastMessage.sender?.id ||
      lastMessage.sender;
    const currentUserId = user?._id || user?.id;

    if (String(senderId) === String(currentUserId)) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }

  }, [messages, highlightId, user]);

  /* ================= HIGHLIGHT SCROLL ================= */
  useEffect(() => {
    if (!highlightId) return;

    const tryScroll = () => {
      const el = messageRefs.current[highlightId];

      if (!el) return false;

      el.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      setActiveHighlight(highlightId);

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = setTimeout(() => {
        setActiveHighlight(null);
      }, 3000);

      return true;
    };

    if (!tryScroll()) {
      requestAnimationFrame(() => {
        tryScroll();
      });
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };

  }, [highlightId, highlightTrigger, messages]);

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

  /* ================= PINNED MESSAGE ================= */
  const pinned = useMemo(
    () => messages.find((m) => m.pinned),
    [messages]
  );

  const pinnedSender =
    typeof pinned?.sender === "object" ? pinned.sender : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* ================= PINNED MESSAGE ================= */}
      {pinned && (
        <div
          onClick={() => onOpenThread?.(pinned)}
          className="flex-shrink-0 bg-white px-6 py-2 flex items-center gap-3 text-sm cursor-pointer shadow-sm"
        >
          <span className="text-yellow-600">📌</span>

          <img
            src={
              getFileUrl(pinnedSender?.avatar) ||
              `https://ui-avatars.com/api/?name=${pinnedSender?.name || "User"}`
            }
            className="w-5 h-5 rounded-full"
          />

          <span className="font-medium">
            {pinnedSender?.name || "User"}:
          </span>

          <span className="truncate flex-1">
            {pinned.text}
          </span>

          {isChannelAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin?.(pinned._id);
              }}
              className="text-xs text-yellow-700 hover:underline"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      {/* ================= MESSAGE LIST ================= */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const senderObj =
              typeof m.sender === "object" ? m.sender : null;

            const senderId =
              senderObj?._id ||
              senderObj?.id ||
              m.sender;

            const isSender = String(senderId) === String(user?._id);

            const messageDate = new Date(m.createdAt).toDateString();
            const showDateSeparator = messageDate !== lastDate;
            lastDate = messageDate;

            const canConvert =
              (user?.role === "Moderator" || isChannelAdmin) &&
              !m.convertedToTask &&
              !readOnly;

            const isFileOnly =
              (!m.text || !m.text.trim()) &&
              m.attachments &&
              m.attachments.length > 0;

            return (
              <div
                key={m._id}
                id={`message-${m._id}`}
                ref={(el) => {
                  if (el) messageRefs.current[m._id] = el;
                }}
              >
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
                  <div className="relative flex gap-3 max-w-[70%] w-fit">

                    {/* LEFT AVATAR */}
                    {!isSender && (
                      <img
                        src={
                          getFileUrl(senderObj?.avatar) ||
                          `https://ui-avatars.com/api/?name=${senderObj?.name || "User"}`
                        }
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover mt-1"
                      />
                    )}

                    <div className="flex flex-col">

                      {/* ================= MESSAGE CONTENT ================= */}
                      <MessageRenderer
                        m={m}
                        isSender={isSender}
                        isChannelAdmin={isChannelAdmin}
                        canConvert={canConvert}
                        readOnly={readOnly}
                        activeHighlight={activeHighlight}
                        highlightMentions={highlightMentions}
                        recentlyConvertedId={recentlyConvertedId}
                        onReact={onReact}
                        onConvert={onConvert}
                        onPin={onPin}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onOpenThread={onOpenThread}
                        onReply={onReply}
                        onJumpToMessage={onJumpToMessage}
                      />

                      {/* ================= THREAD PREVIEW ================= */}
                      {m.replyCount > 0 && (
                        <button
                          onClick={() => onOpenThread?.(m)}
                          className="mt-2 inline-flex items-center gap-2 text-xs text-purple-600 hover:underline"
                        >
                          View thread ({m.replyCount} replies)
                          {m.unreadThreadCount > 0 && (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white no-underline">
                              {m.unreadThreadCount > 9 ? "9+" : m.unreadThreadCount}
                            </span>
                          )}
                        </button>
                      )}

                      {/* ================= REACTIONS ================= */}
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

                      {/* ================= MESSAGE TIME ================= */}
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
                          getFileUrl(senderObj?.avatar) ||
                          `https://ui-avatars.com/api/?name=${senderObj?.name || "User"}`
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

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
