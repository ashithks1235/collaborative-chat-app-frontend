import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import ThreadMessageList from "../components/thread/ThreadMessageList";
import ThreadInput from "../components/thread/ThreadInput";
import ConvertToTaskModal from "../components/chat/ConvertToTaskModal";

export default function ThreadPanel({ message, onClose, isChannelAdmin, channelMembers, projects }) {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === "Admin";

  const [replies, setReplies] = useState([]);
  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [convertMessage, setConvertMessage] = useState(null);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  /* ================= LOAD REPLIES ================= */

  useEffect(() => {
    if (!message?._id) return;

    const loadReplies = async () => {
      try {
        const res = await api.get(`/messages/${message._id}/replies`);
        const fetched = res.data?.data?.replies || [];

        setReplies(fetched);

        const unread = fetched.find(
          r => user?._id && !r.seenBy?.includes(user._id)
        );

        if (unread) setFirstUnreadId(unread._id);

      } catch {
        console.log("Failed to load thread");
      }
    };

    loadReplies();
  }, [message?._id]);

  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {
    if (!socket || !message?._id) return;

    const id = String(message._id);

    const handleReplyAdded = ({ parentMessage, reply }) => {
      if (String(parentMessage) !== id) return;

      setReplies(prev => {
        if (prev.some(r => r._id === reply._id)) return prev;
        return [...prev, reply];
      });
    };

    const handleReplyDeleted = ({ messageId, parentMessage }) => {
      if (String(parentMessage) !== id) return;

      setReplies(prev => prev.filter(r => r._id !== messageId));
    };

    const handleReplyUpdated = (updatedReply) => {
    if (String(updatedReply.parentMessage) !== id) return;
    setReplies(prev =>
      prev.map(r =>
        r._id === updatedReply._id
          ? { ...r, ...updatedReply }
          : r
      )
    );
  };

    socket.on("thread:replyAdded", handleReplyAdded);
    socket.on("thread:replyDeleted", handleReplyDeleted);
    socket.on("thread:replyUpdated", handleReplyUpdated);

    return () => {
      socket.off("thread:replyAdded", handleReplyAdded);
      socket.off("thread:replyDeleted", handleReplyDeleted);
      socket.off("thread:replyUpdated", handleReplyUpdated);
    };

  }, [socket, message?._id]);

  /* ================= AUTO SCROLL TO NEWEST REPLY ================= */

    useEffect(() => {

      if (!bottomRef.current) return;

      bottomRef.current.scrollIntoView({
        behavior: "smooth"
      });

    }, [replies]);

  /* ================= MARK THREAD READ ================= */

  useEffect(() => {
    if (!message?._id) return;

    api.put(`/messages/${message._id}/mark-thread-read`)
      .catch(() => {});

    setFirstUnreadId(null);

  }, [message?._id]);

  if (!message) return null;

  return (
    <motion.div
      initial={{ x: 350 }}
      animate={{ x: 0 }}
      exit={{ x: 350 }}
      transition={{ duration: 0.25 }}
      className="fixed right-0 top-0 h-full w-[420px]
      bg-white dark:bg-gray-900
      border-l dark:border-gray-700
      shadow-xl flex flex-col z-50"
    >

      {/* ================= HEADER ================= */}

      <div className="px-5 py-4 flex justify-between items-center">

        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Thread
          </h3>
          <p className="text-xs text-gray-500">
            Reply to this message
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

      </div>

      {/* ================= ORIGINAL MESSAGE ================= */}

      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex gap-3">
          {/* Avatar */}
          <img
            src={
              message.sender?.avatar ||
              `https://ui-avatars.com/api/?name=${message.sender?.name}`
            }
            className="w-9 h-9 rounded-full object-cover mt-1"
          />
          <div className="flex-1">
            {/* Name + time */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                {message.sender?.name}
              </span>

              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Message bubble */}
            <div className="mt-2 inline-block max-w-[85%] px-4 py-3 rounded-xl shadow-sm
            bg-white dark:bg-gray-900 border dark:border-gray-700">

              <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {message.text}
              </p>

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {message.attachments.map(file => {
                    const fileUrl = file.url?.startsWith("http")
                      ? file.url
                      : `http://localhost:3000${file.url}`;
                    const isImage = file.type?.startsWith("image");
                    if (isImage) {
                      return (
                        <img
                          key={file._id}
                          src={fileUrl}
                          className="max-w-xs rounded-lg border"
                        />
                      );
                    }
                    return (
                      <a
                        key={file._id}
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        📎 {file.name}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="text-xs text-purple-600 mt-2 font-medium">
            💬 {message.replyCount || 0} replies in this thread
          </div>
          </div>
        </div>
      </div>

      {/* ================= REPLIES ================= */}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        <ThreadMessageList
          replies={replies}
          setReplies={setReplies}
          firstUnreadId={firstUnreadId}
          isChannelAdmin={isChannelAdmin}
          setEditingReply={setEditingReply}
          onConvert={setConvertMessage}
        />
      </div>

      <div ref={bottomRef} />

      {/* ================= INPUT ================= */}

      {!isSuperAdmin && (
        <ThreadInput
          parentId={message._id}
          editingReply={editingReply}
          setEditingReply={setEditingReply}
        />
      )}

      <ConvertToTaskModal
        isOpen={!!convertMessage}
        message={convertMessage}
        channelMembers={channelMembers}
        projects={projects}
        onClose={() => setConvertMessage(null)}
      />

    </motion.div>
  );
}