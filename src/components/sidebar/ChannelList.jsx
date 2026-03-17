import { useState } from "react";
import ChannelItem from "./ChannelItem";
import { FaCirclePlus } from "react-icons/fa6";
import { useChannelContext } from "../../context/ChannelContext";
import { useAuthContext } from "../../context/AuthContext";

export default function ChannelList() {
  const { channels, addChannel, loading } = useChannelContext();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuthContext();

  const handleCreate = async () => {
    try {
      if (!name.trim()) {
        setError("Channel name required");
        return;
      }

      await addChannel(name);

      setName("");
      setShowModal(false);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create channel"
      );
    }
  };

  if (loading) {
    return <div className="text-xs text-gray-400">Loading...</div>;
  }

  return (
    <div className="mt-4 px-3">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
        <span>My Chatroom</span>

        {(user?.role === "Admin" || user?.role === "Moderator") && (
          <button onClick={() => setShowModal(true)}>
            <FaCirclePlus className="text-blue-500" />
          </button>
        )}
      </div>

      {channels.map((ch) => (
        <ChannelItem
          key={ch._id || ch.id}
          channel={{
            ...ch,
            _id: ch._id || ch.id
          }}
        />
      ))}

      {/* CREATE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Create Channel
              </h3>
              <p className="text-xs text-gray-500">
                Channels help organize conversations.
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <input
                className="
                w-full px-3 py-2 text-sm rounded-lg border
                border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                placeholder="e.g. marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
