import { useEffect } from "react";

export default function useChannelSocket(socket, channelId, setMessages) {

  useEffect(() => {

    if (!socket || !channelId) return;

    socket.emit("join:channel", channelId);

    /* ================= NEW MESSAGE ================= */

    const handleNew = (msg) => {

      if (msg.channel !== channelId || msg.parentMessage) return;

      setMessages(prev => {

        if (prev.some(m => m._id === msg._id)) return prev;

        const filtered = prev.filter(
          m =>
            !m.optimistic ||
            m.text !== msg.text ||
            m.sender?._id !== msg.sender?._id
        );

        return [...filtered, msg];
      });

    };

    /* ================= REACTION ================= */

    const handleReaction = (updated) => {

      if (updated.channel !== channelId) return;

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

      if (updated.channel !== channelId) return;

      setMessages(prev =>
        prev.map(m =>
          m._id === updated._id ? updated : m
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

        if (String(updated.channel) !== String(channelId)) return;

        setMessages(prev =>
            prev.map(m =>
            m._id === updated._id
                ? { ...updated, pinned: true }
                : { ...m, pinned: false }
            )
        );

        };

        const handleUnpinned = (updated) => {

            if (updated.channel !== channelId) return;

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

      setMessages(prev =>
        prev.map(m => {

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

      setMessages(prev =>
        prev.map(m => {

          if (String(m._id) !== String(parentMessage)) return m;

          return {
            ...m,
            replyCount: Math.max((m.replyCount || 1) - 1, 0)
          };

        })
      );

    };

    /* ================= REGISTER EVENTS ================= */

    socket.on("message:new", handleNew);
    socket.on("message:reaction", handleReaction);
    socket.on("message:updated", handleUpdate);
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
      socket.off("message:deleted", handleDelete);
      socket.off("message:pinned", handlePinned);
      socket.off("message:unpinned", handleUnpinned);
      socket.off("thread:replyAdded", handleThreadReplyAdded);
      socket.off("thread:replyDeleted", handleThreadReplyDeleted);

    };

  }, [socket, channelId, setMessages]);

}