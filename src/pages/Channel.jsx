import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useSocketContext } from "../context/SocketContext";
import { useChannelContext } from "../context/ChannelContext";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import ConvertToTaskModal from "../components/chat/ConvertToTaskModal";
import AddMemberModal from "../components/channel/AddMemberModal";
import Loader from "../components/ui/Loader";

import getErrorMessage from "../utils/getErrorMessage";
import api from "../api/axios";
import ThreadPanel from "../layout/ThreadPanel";

export default function Channel() {

  const { id } = useParams();
  const { socket } = useSocketContext();
  const { channels } = useChannelContext();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(true);

  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [channelProjects, setChannelProjects] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [recentlyConvertedId, setRecentlyConvertedId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeThread, setActiveThread] = useState(null);

  const isSuperAdmin = user?.role === "Admin";

  /* ================= LOAD CHANNEL ================= */
  useEffect(() => {
    let mounted = true;

    const fetchChannel = async () => {
      if (!id) return;
      setLoadingChannel(true);

      const existing = channels.find((c) => c._id === id);

      if (existing) {
        if (mounted) setChannel(existing);
        setLoadingChannel(false);
        return;
      }

      try {
        const res = await api.get(`/channels/${id}`);
        if (mounted) setChannel(res.data?.data);
      } catch {
        if (mounted) setChannel(null);
      } finally {
        if (mounted) setLoadingChannel(false);
      }
    };

    fetchChannel();
    return () => (mounted = false);
  }, [id, channels]);

  /* ================= LOAD PROJECTS ================= */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const allProjects = res.data?.data || [];

        const filtered = allProjects.filter(
          (p) => p.channel?._id === id
        );

        setChannelProjects(filtered);
      } catch (err) {
        console.error("Failed to load projects");
      }
    };

    if (id) fetchProjects();
  }, [id]);

  /* ================= LOAD MESSAGES ================= */
  const loadMessages = useCallback(async (page = 1) => {
    if (!id) return;

    try {
      setLoadingMessages(true);

      const res = await api.get(`/messages/${id}`, {
        params: { page, limit: 30 },
      });

      const { messages: newMessages, pagination } = res.data.data;

      if (page === 1) {
        setMessages(newMessages);
      } else {
        setMessages((prev) => [...newMessages, ...prev]);
      }

      setPagination(pagination);
    } catch (err) {
      showToast(getErrorMessage(err));
      if (page === 1) setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadMessages(1);
  }, [loadMessages]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
  if (!socket || !id) return;

  socket.emit("join:channel", id);

  /* ================= NEW MESSAGE ================= */
  const handleNew = (msg) => {
    if (msg.channel !== id) return;

    // ❗ Ignore thread replies here
    if (msg.parentMessage) return;

    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) {
        return prev;
      }

      const filtered = prev.filter(
        (m) =>
          !m.optimistic ||
          m.text !== msg.text ||
          m.sender?._id !== msg.sender?._id
      );

      return [...filtered, msg];
    });
  };

  /* ================= REACTION ================= */
  const handleReaction = (updated) => {
    if (updated.channel !== id) return;

    setMessages((prev) =>
      prev.map((m) =>
        m._id === updated._id ? updated : m
      )
    );
  };

  /* ================= MESSAGE UPDATE ================= */
  const handleUpdate = (updated) => {
    if (updated.channel !== id) return;

    setMessages((prev) =>
      prev.map((m) =>
        m._id === updated._id ? updated : m
      )
    );
  };

  /* ================= DELETE MESSAGE ================= */
  const handleDelete = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, text: "This message was deleted", isDeleted: true }
          : m
      )
    );
  };

  /* ================= THREAD REPLY ADDED ================= */
  const handleThreadReplyAdded = ({ parentMessage, reply }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (String(m._id) !== String(parentMessage)) return m;

        return {
          ...m,
          replyCount: (m.replyCount || 0) + 1,
          lastReply: {
            _id: reply._id,
            text: reply.text,
            sender: reply.sender,
            createdAt: reply.createdAt
          }
        };
      })
    );
  };

  /* ================= THREAD REPLY DELETED ================= */
  const handleThreadReplyDeleted = ({ parentMessage }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (String(m._id) !== String(parentMessage)) return m;

        return {
          ...m,
          replyCount: Math.max((m.replyCount || 1) - 1, 0)
        };
      })
    );
  };

  /* ================= SOCKET LISTENERS ================= */
  socket.on("message:new", handleNew);
  socket.on("message:reaction", handleReaction);
  socket.on("message:updated", handleUpdate);
  socket.on("message:deleted", handleDelete);
  socket.on("thread:replyAdded", handleThreadReplyAdded);
  socket.on("thread:replyDeleted", handleThreadReplyDeleted);

  return () => {
    socket.emit("leave:channel", id);

    socket.off("message:new", handleNew);
    socket.off("message:reaction", handleReaction);
    socket.off("message:updated", handleUpdate);
    socket.off("message:deleted", handleDelete);
    socket.off("thread:replyAdded", handleThreadReplyAdded);
    socket.off("thread:replyDeleted", handleThreadReplyDeleted);
  };
}, [socket, id]);

  /* ================= MESSAGE ACTIONS ================= */

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (err) {
      showToast(getErrorMessage(err));
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await api.post(
        `/messages/${messageId}/react`,
        { emoji }
      );

      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? res.data.data : m
        )
      );
    } catch (err) {
      showToast(getErrorMessage(err));
    }
  };

  const handleConvertSuccess = (task) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === selectedMessage._id
          ? {
              ...m,
              convertedToTask: true,
              linkedTask: task._id,
              projectId: task.project,
            }
          : m
      )
    );

    setRecentlyConvertedId(selectedMessage._id);

    setTimeout(() => {
      setRecentlyConvertedId(null);
    }, 2000);

    setSelectedMessage(null);
  };

  const isChannelAdmin = useMemo(() => {
  return channel?.members?.some((m) =>
    (typeof m.user === "string"
      ? m.user === user?._id
      : m.user?._id === user?._id) &&
    m.role === "admin"
  );
}, [channel, user]);

const cleanMembers = useMemo(() => {
  if (!channel?.members) return [];

  const members = channel.members.map((m) =>
    typeof m.user === "string"
      ? { _id: m.user, name: m.name }
      : m.user
  );

  if (!user?._id) return members;

  const currentUser = members.find(
    (m) => String(m._id) === String(user._id)
  );

  const others = members.filter(
    (m) => String(m._id) !== String(user._id)
  );

  return currentUser ? [currentUser, ...others] : members;
}, [channel, user]);

// 🔽 THEN do conditional returns
if (loadingChannel) return <Loader />;
if (!channel) return <div className="p-6">Channel not found</div>;

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* CHAT */}
      <MessageList
        messages={messages}
        channelId={id}
        isChannelAdmin={isChannelAdmin}
        readOnly={isSuperAdmin}
        onDelete={handleDelete}
        onReact={handleReact}
        onConvert={(msg) => setSelectedMessage(msg)}
        recentlyConvertedId={recentlyConvertedId}
        onEdit={(msg) => setEditingMessage(msg)}
        onOpenThread={(msg) => setActiveThread(msg)}
      />

      {activeThread && (
        <ThreadPanel
          message={activeThread}
          onClose={() => setActiveThread(null)}
          isChannelAdmin={isChannelAdmin}
        />
      )}

      {!isSuperAdmin && (
        <ChatInput
          channelId={id}
          setMessages={setMessages}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
        />
      )}

      <ConvertToTaskModal
        isOpen={!!selectedMessage}
        message={selectedMessage}
        projects={channelProjects}
        channelMembers={cleanMembers}
        onClose={() => setSelectedMessage(null)}
        onSuccess={handleConvertSuccess}
      />

      {showAddMember && (
        <AddMemberModal
          channelId={id}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </motion.div>
  );
}