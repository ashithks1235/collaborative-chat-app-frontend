import { useEffect } from "react";

export default function useChannelSocket(socket, channelId, setMessages, currentUserId) {

  useEffect(() => {

    if (!socket || !channelId) return;

    socket.emit("join:channel", channelId);

    /* ================= NEW MESSAGE ================= */

    const handleNew = (msg) => {
      const incomingChannelId = msg.channel?._id || msg.channel;
      if (String(incomingChannelId) !== String(channelId) || msg.parentMessage) return;

      setMessages(prev => {

        if (prev.some(m => m._id === msg._id)) return prev;

        const filtered = prev.filter(m => {
        const prevSenderId = m.sender?._id || m.sender;
        const newSenderId = msg.sender?._id || msg.sender;

        return (
            !m.optimistic ||
            m.text !== msg.text ||
            String(prevSenderId) !== String(newSenderId)
        );
        });

        return [...filtered, msg];
      });

    };

    /* ================= REACTION ================= */

    const handleReaction = (updated) => {
      const updatedChannelId = updated.channel?._id || updated.channel;
      if (String(updatedChannelId) !== String(channelId)) return;

      setMessages(prev =>
        prev.map(m =>
          m._id === updated._id
            ? { ...m, ...updated }
            : m
        )
      );

    };

    /* ================= MESSAGE UPDATE ================= */

    const handleUpdate = (updated) => {
      const updatedChannelId = updated.channel?._id || updated.channel;
      if (String(updatedChannelId) !== String(channelId)) return;

      setMessages(prev =>
        prev.map(m =>
          m._id === updated._id
            ? { ...m, ...updated }
            : m
        )
      );

    };

    /* ================= DELETE MESSAGE ================= */

    const handleDelete = (messageId) => {

      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? {
                ...m,
                text: "This message was deleted",
                isDeleted: true,
                attachments: [],
                reactions: []
              }
            : m
        )
      );

    };

    /* ================= PIN ================= */

    const handlePinned = (updated) => {
        const updatedChannelId = updated.channel?._id || updated.channel;
        if (String(updatedChannelId) !== String(channelId)) return;

        setMessages(prev =>
            prev.map(m =>
            m._id === updated._id
                ? { ...updated, pinned: true }
                : { ...m, pinned: false }
            )
        );

        };

        const handleUnpinned = (updated) => {
            const updatedChannelId = updated.channel?._id || updated.channel;
            if (String(updatedChannelId) !== String(channelId)) return;

            setMessages(prev =>
                prev.map(m =>
                m._id === updated._id
                    ? { ...m, pinned: false }
                    : m
                )
            );

            };

    /* ================= THREAD REPLY ADDED ================= */

    const handleThreadReplyAdded = ({ parentMessage, reply }) => {
      const replySenderId = reply?.sender?._id || reply?.sender;
      const isOwnReply = currentUserId && String(replySenderId) === String(currentUserId);

      setMessages(prev =>
        prev.map(m => {

          if (String(m._id) !== String(parentMessage)) return m;

          return {
            ...m,
            replyCount: (m.replyCount || 0) + 1,
            unreadThreadCount: isOwnReply ? (m.unreadThreadCount || 0) : (m.unreadThreadCount || 0) + 1,
            hasUnreadThread: isOwnReply ? Boolean(m.hasUnreadThread) : true,
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

      setMessages(prev =>
        prev.map(m => {

          if (String(m._id) !== String(parentMessage)) return m;

          return {
            ...m,
            replyCount: Math.max((m.replyCount || 1) - 1, 0),
            unreadThreadCount: Math.max((m.unreadThreadCount || 1) - 1, 0),
            hasUnreadThread: Math.max((m.unreadThreadCount || 1) - 1, 0) > 0
          };

        })
      );

    };

    /* ================= REGISTER EVENTS ================= */

    socket.on("message:new", handleNew);
    socket.on("message:reaction", handleReaction);
    socket.on("message:updated", handleUpdate);
    socket.on("thread:replyUpdated", handleUpdate);
    socket.on("message:deleted", handleDelete);
    socket.on("message:pinned", handlePinned);
    socket.on("message:unpinned", handleUnpinned);
    socket.on("thread:replyAdded", handleThreadReplyAdded);
    socket.on("thread:replyDeleted", handleThreadReplyDeleted);

    /* ================= CLEANUP ================= */

    return () => {

      socket.emit("leave:channel", channelId);

      socket.off("message:new", handleNew);
      socket.off("message:reaction", handleReaction);
      socket.off("message:updated", handleUpdate);
      socket.off("thread:replyUpdated", handleUpdate);
      socket.off("message:deleted", handleDelete);
      socket.off("message:pinned", handlePinned);
      socket.off("message:unpinned", handleUnpinned);
      socket.off("thread:replyAdded", handleThreadReplyAdded);
      socket.off("thread:replyDeleted", handleThreadReplyDeleted);

    };

  }, [socket, channelId, setMessages, currentUserId]);

}
