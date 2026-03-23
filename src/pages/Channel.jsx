import { lazy, Suspense, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { useSocketContext } from "../context/SocketContext";
import { useChannelContext } from "../context/ChannelContext";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUI } from "../context/UIContext";

import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import ConvertToTaskModal from "../components/chat/ConvertToTaskModal";
import AddMemberModal from "../components/channel/AddMemberModal";
import Loader from "../components/ui/Loader";

import api from "../api/axios";
import getErrorMessage from "../utils/getErrorMessage";

import useChannelData from "../hooks/useChannelData";
import useChannelProjects from "../hooks/useChannelProjects";
import useChannelMessages from "../hooks/useChannelMessages";
import useChannelSocket from "../hooks/useChannelSocket";

const ThreadPanel = lazy(() => import("../layout/ThreadPanel"));

function ThreadPanelSkeleton() {
  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export default function Channel() {

  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const urlHighlight = searchParams.get("highlight");
  const trigger = searchParams.get("t");

  const { socket } = useSocketContext();
  const { channels = [] } = useChannelContext();
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const { showAddMember, setShowAddMember } = useUI();
  const [jumpHighlight, setJumpHighlight] = useState(null);

  const isSuperAdmin = user?.role === "Admin";



  /* ================= DATA HOOKS ================= */

  const { channel, loadingChannel } =
    useChannelData(id, channels);

  const channelProjects =
    useChannelProjects(id);

  const {
    messages,
    setMessages,
    loadMessages
  } = useChannelMessages(id, showToast);

  /* ================= SOCKET HOOK ================= */

  useChannelSocket(socket, id, setMessages, user?._id || user?.id);

  /* ================= UI STATE ================= */

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [recentlyConvertedId, setRecentlyConvertedId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);

  useEffect(() => {
    if (!urlHighlight) return;
    setJumpHighlight(null);
    requestAnimationFrame(() => {
      setJumpHighlight(urlHighlight);
    });

  }, [urlHighlight, trigger]);

  /* ================= LOAD MESSAGES ================= */

  useEffect(() => {
    loadMessages(1);
  }, [loadMessages]);

  /* ================= ACTIONS ================= */

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);

      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? { ...m, isDeleted: true, pinned: false }
            : m
        )
      );

    } catch (err) {
      showToast(getErrorMessage(err));
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {

      const res = await api.post(`/messages/${messageId}/react`, { emoji });

      setMessages(prev =>
        prev.map(m =>
          m._id === messageId ? (res.data || res) : m
        )
      );

    } catch (err) {
      showToast(getErrorMessage(err));
    }
  };

  const handlePin = async (messageId) => {
    try {

      const res = await api.put(`/messages/${messageId}/pin`);

      setMessages(prev =>
        prev.map(m =>
          m._id === messageId ? (res.data || res) : { ...m, pinned: false }
        )
      );

    } catch (err) {
      showToast(getErrorMessage(err));
    }
  };

  const handleReply = (message) => {
    setReplyMessage(message);
  };

  const handleOpenThread = (message) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === message._id
          ? { ...m, unreadThreadCount: 0, hasUnreadThread: false }
          : m
      )
    );

    setActiveThread({
      ...message,
      unreadThreadCount: 0,
      hasUnreadThread: false
    });
  };

  const handleConvertSuccess = (task) => {

    setMessages(prev =>
      prev.map(m =>
        m._id === selectedMessage._id
          ? {
              ...m,
              convertedToTask: true,
              linkedTask: task._id,
              projectId: task.project
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

  /* ================= ADMIN CHECK ================= */

  const isChannelAdmin = useMemo(() => {

    if (!channel || !Array.isArray(channel.members)) return false;

    return channel.members.some(m =>
      (typeof m.user === "string"
        ? m.user === user?._id
        : m.user?._id === user?._id) &&
      m.role === "admin"
    );

  }, [channel, user]);

  /* ================= MEMBER LIST ================= */

  const cleanMembers = useMemo(() => {

    if (!channel || !Array.isArray(channel.members)) return [];

    const members = channel.members
      .filter(m => m?.user)
      .map(m =>
        typeof m.user === "string"
          ? { _id: m.user, name: m.name }
          : m.user
      );

    const currentUser = members.find(
      m => String(m._id) === String(user?._id)
    );

    const others = members.filter(
      m => String(m._id) !== String(user?._id)
    );

    return currentUser ? [currentUser, ...others] : members;

  }, [channel, user]);

  /* ================= LOADING ================= */

  if (loadingChannel) return <Loader />;

  if (!channel || !Array.isArray(channel.members)) {
    return <div className="p-6">Channel not ready</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="flex h-full flex-col overflow-hidden transition-opacity duration-200">

      <MessageList
        messages={messages}
        highlightId={jumpHighlight || urlHighlight}
        highlightTrigger={trigger}
        isChannelAdmin={isChannelAdmin}
        readOnly={isSuperAdmin}
        onDelete={handleDelete}
        onReact={handleReact}
        onConvert={(msg) => setSelectedMessage(msg)}
        onPin={handlePin}
        recentlyConvertedId={recentlyConvertedId}
        onEdit={(msg) => setEditingMessage(msg)}
        onOpenThread={handleOpenThread}
        onJumpToMessage={(id) => {
          setJumpHighlight(null);

          requestAnimationFrame(() => {
            setJumpHighlight(id);

            setTimeout(() => {
              setJumpHighlight(null);
            }, 3000);
          });
        }}
        onReply={handleReply}
      />

      {activeThread && (
        <Suspense fallback={<ThreadPanelSkeleton />}>
          <ThreadPanel
            message={activeThread}
            onClose={() => setActiveThread(null)}
            isChannelAdmin={isChannelAdmin}
            channelMembers={cleanMembers}
            projects={channelProjects}
          />
        </Suspense>
      )}

      {!isSuperAdmin && (
        <ChatInput
          channelId={id}
          setMessages={setMessages}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
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
          currentMembers={cleanMembers}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => {
            setShowAddMember(false);
            window.location.reload();
          }}
        />
      )}

    </div>
  );
}
