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
  setEditingMessage,
  replyMessage,
  setReplyMessage
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const textareaRef = useRef(null);
  const typingTimeout = useRef(null);

  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  const isDisabled = !text.trim() && !file;

  /* ================= LOAD MESSAGE INTO INPUT ================= */

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
      replyTo: replyMessage || null,
      attachments: file
        ? [
            {
              name: file.name,
              url: URL.createObjectURL(file),
              type: file.type
            }
          ]
        : [],
      createdAt: new Date(),
      optimistic: true
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {

      const formData = new FormData();
      formData.append("channelId", channelId);
      formData.append("text", text);

      if (replyMessage?._id) {
        formData.append("replyTo", replyMessage._id);
      }

      if (file) formData.append("files", file);

      const res = await api.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const realMessage = res.data.data;

      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? realMessage : m
        )
      );

      socket?.emit("typing:stop", { channelId });

      setText("");
      setFile(null);
      setReplyMessage(null);
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

    if (typingTimeout.current)
      clearTimeout(typingTimeout.current);

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
    <div className="bg-white p-3 shadow-sm">

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

      {/* REPLY BAR */}

      {replyMessage && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
          <span>
            Replying to <strong>{replyMessage.sender?.name}</strong>
            {replyMessage.attachments?.length > 0 &&
              ` 📎 ${replyMessage.attachments[0]?.name || "file"}`}
          </span>

          <button
            onClick={() => setReplyMessage(null)}
            className="text-red-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="text-red-500 text-xs mb-2">
          {error}
        </div>
      )}

      {/* FILE PREVIEW */}

      {file && (
        <div className="mb-2 flex items-center justify-between bg-gray-100 px-3 py-2 rounded text-xs">
          <span>📎 {file.name}</span>

          <button
            onClick={() => setFile(null)}
            className="text-red-500 hover:underline"
          >
            remove
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">

        {/* ATTACHMENT BUTTON */}

        {!editingMessage && (
          <label className="cursor-pointer text-gray-500">
            <CgAttachment size={20} />
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        )}

        {/* TEXT INPUT */}

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

        {/* SEND BUTTON */}

        <button
          onClick={send}
          disabled={isDisabled}
          className={`
            px-4 py-2 rounded-lg transition-all duration-200
            flex items-center justify-center
            ${
              editingMessage
                ? isDisabled
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
                : isDisabled
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }
          `}
        >
          {editingMessage ? (
            "Update"
          ) : (
            <FaPaperPlane
              className={`transition-opacity ${
                isDisabled ? "opacity-40" : "opacity-100"
              }`}
            />
          )}
        </button>

      </div>
    </div>
  );
}