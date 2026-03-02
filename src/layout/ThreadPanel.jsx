import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import ThreadMessageList from "../components/thread/ThreadMessageList";

export default function ThreadPanel({ message, onClose, isChannelAdmin }) {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");
  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [editingReply, setEditingReply] = useState(null);

  const containerRef = useRef(null);

  /* ================= LOAD REPLIES ================= */
  useEffect(() => {
    if (!message?._id) return;

    const loadReplies = async () => {
      try {
        const res = await api.get(`/messages/${message._id}/replies`);
        const fetchedReplies = res.data?.data?.replies || [];

        setReplies(fetchedReplies);

        const unread = fetchedReplies.find(
          (r) => !r.seenBy?.includes(user?._id)
        );

        if (unread) {
          setFirstUnreadId(unread._id);
        }
      } catch (err) {
        console.error("Failed to load thread replies");
      }
    };

    loadReplies();
  }, [message, user]);

  /* ================= REALTIME SOCKET EVENTS ================= */
  useEffect(() => {
  if (!socket || !message?._id) return;

  const currentMessageId = String(message._id);

  /* 🔥 NEW REPLY */
  const handleReplyAdded = ({ parentMessage, reply }) => {
    if (String(parentMessage) !== currentMessageId) return;

    setReplies((prev) => {
      if (prev.some((r) => r._id === reply._id)) return prev;
      return [...prev, reply];
    });

    if (String(reply.sender?._id) !== String(user?._id)) {
      setFirstUnreadId(reply._id);
    }

    scrollToBottom?.();
  };

  /* ✏️ EDIT REPLY */
  const handleReplyUpdated = (updated) => {
    if (!updated.parentMessage) return;

    if (String(updated.parentMessage) !== currentMessageId) return;

    setReplies((prev) =>
      prev.map((r) =>
        r._id === updated._id ? updated : r
      )
    );
  };

  /* 🗑 DELETE REPLY */
  const handleReplyDeleted = ({ messageId, parentMessage }) => {
    if (String(parentMessage) !== currentMessageId) return;

    setReplies((prev) =>
      prev.filter((r) => r._id !== messageId)
    );
  };

  socket.on("thread:replyAdded", handleReplyAdded);
  socket.on("thread:replyDeleted", handleReplyDeleted);
  socket.on("message:updated", handleReplyUpdated);

  return () => {
    socket.off("thread:replyAdded", handleReplyAdded);
    socket.off("thread:replyDeleted", handleReplyDeleted);
    socket.off("message:updated", handleReplyUpdated);
  };
}, [socket, message?._id, user?._id]);

  /* ================= AUTO SCROLL ================= */
  const scrollToBottom = () => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop =
          containerRef.current.scrollHeight;
      }
    }, 100);
  };

  /* ================= JUMP TO FIRST UNREAD ================= */
  useEffect(() => {
    if (!firstUnreadId) return;

    setTimeout(() => {
      const el = document.getElementById(
        `thread-${firstUnreadId}`
      );

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 300);
  }, [firstUnreadId]);

  /* ================= SEND REPLY ================= */
  const sendReply = async () => {
  if (!text.trim()) return;

  try {
    // 🔥 If editing
    if (editingReply) {
      await api.put(`/messages/${editingReply._id}`, {
        text
      });

      setEditingReply(null);
    } 
    // 🔥 If new reply
    else {
      await api.post(
        `/messages/${message._id}/reply`,
        { text }
      );
    }

    setText("");
  } catch (err) {
    console.error("Failed to send/update reply");
  }
};

  /* ================= MARK THREAD READ ================= */
  useEffect(() => {
    if (!message?._id) return;

    api
      .put(`/messages/${message._id}/mark-thread-read`)
      .catch(() => {});

    setFirstUnreadId(null);
  }, [message]);

  /* ================= CONVERT THREAD REPLY ================= */
  const handleConvertThread = async (reply) => {
    try {
      await api.post(
        `/messages/${reply._id}/convert-to-task`,
        { projectId: null }
      );
    } catch {
      console.error("Thread convert failed");
    }
  };

  /* ================= EDIT THREAD REPLY ================= */
const handleEditThread = (reply) => {
  setEditingReply(reply);
  setText(reply.text);
};

/* ================= DELETE THREAD REPLY ================= */
const handleDeleteThread = async (reply) => {
  try {
    await api.delete(`/messages/${reply._id}`);
  } catch (err) {
    console.error("Failed to delete thread reply");
  }
};

if (!message) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-xl flex flex-col z-50">

      {/* ================= HEADER ================= */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Thread</h3>
        <button onClick={onClose}>✕</button>
      </div>

      {/* ================= ORIGINAL MESSAGE ================= */}
      <div className="p-4 border-b bg-gray-50">
        <p className="font-semibold">
          {message.sender?.name}
        </p>
        <p className="text-sm mt-1">
          {message.text}
        </p>
      </div>

      {/* ================= REPLIES ================= */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        <ThreadMessageList
          replies={replies}
          onConvertThread={handleConvertThread}
          onEditThread={handleEditThread}
          onDeleteThread={handleDeleteThread}
          isChannelAdmin={isChannelAdmin}
          firstUnreadId={firstUnreadId}
        />
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply in thread..."
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          rows={3}
        />

        <button
          onClick={sendReply}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}