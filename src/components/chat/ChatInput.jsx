import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";
import { FaPaperPlane } from "react-icons/fa6";
import { CgAttachment } from "react-icons/cg";

export default function ChatInput({
  channelId,
  setMessages,
  editingMessage,
  setEditingMessage
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const textareaRef = useRef(null);
  const typingTimeout = useRef(null);

  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  /* ================= LOAD MESSAGE INTO INPUT (EDIT MODE) ================= */
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  /* ================= SEND / UPDATE ================= */
  const send = async () => {
    if (!text.trim() && !file) return;

    /* ===== EDIT MODE ===== */
    if (editingMessage) {
      try {
        const res = await api.put(
          `/messages/${editingMessage._id}`,
          { text }
        );

        const updated = res.data.data;

        setMessages((prev) =>
          prev.map((m) =>
            m._id === updated._id ? updated : m
          )
        );

        setEditingMessage(null);
        setText("");
        return;
      } catch {
        setError("Failed to update message");
        return;
      }
    }

    /* ===== NORMAL SEND ===== */
    const tempId = Date.now();

    const optimisticMessage = {
      _id: tempId,
      channel: channelId,
      text,
      sender: user,
      createdAt: new Date(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const formData = new FormData();
      formData.append("channelId", channelId);
      formData.append("text", text);
      if (file) formData.append("files", file);

      const res = await api.post("/messages", formData);
      const realMessage = res.data.data;

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? realMessage : m))
      );

      socket?.emit("typing:stop", { channelId });

      setText("");
      setFile(null);
      setError(null);
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempId)
      );
      setError("Failed to send message");
    }
  };

  /* ================= TYPING ================= */
  const handleTyping = (value) => {
    setText(value);

    if (!socket) return;

    socket.emit("typing:start", { channelId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", { channelId });
    }, 1000);
  };

  /* ================= CANCEL EDIT ================= */
  const cancelEdit = () => {
    setEditingMessage(null);
    setText("");
  };

  return (
    <div className="bg-white p-3 border-t">

      {/* EDIT MODE BAR */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-xs">
          <span>Editing message</span>
          <button
            onClick={cancelEdit}
            className="text-red-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-xs mb-2">
          {error}
        </div>
      )}

      <div className="flex gap-2 items-end">
        {!editingMessage && (
          <label className="cursor-pointer text-gray-500">
            <CgAttachment />
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="flex-1 resize-none bg-gray-100 rounded-lg px-3 py-2"
          placeholder={
            editingMessage
              ? "Update your message..."
              : "Type a message..."
          }
        />

        <button
          onClick={send}
          disabled={!text.trim() && !file}
          className={`px-4 py-2 rounded-lg text-white ${
            editingMessage
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {editingMessage ? "Update" : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );
}